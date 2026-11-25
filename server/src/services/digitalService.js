const pool = require('../db/pool');

const MAX_CONCURRENT_STUDENTS = 30;
const ACCESS_DAYS = 4;

async function requestDigitalAccess(userId, userRole, bookId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookRes = await client.query(
      'SELECT id, title, has_digital FROM books WHERE id = $1 FOR UPDATE',
      [bookId]
    );
    const book = bookRes.rows[0];

    if (!book) {
      throw { status: 404, message: 'Book not found' };
    }
    if (!book.has_digital) {
      throw { status: 400, message: 'Digital version is not available for this book' };
    }

    await client.query(
      `UPDATE digital_access 
       SET is_active = FALSE 
       WHERE book_id = $1 AND is_active = TRUE AND expires_at <= NOW()`,
      [bookId]
    );

    const existingRes = await client.query(
      `SELECT id, expires_at FROM digital_access 
       WHERE user_id = $1 AND book_id = $2 AND is_active = TRUE AND expires_at > NOW()`,
      [userId, bookId]
    );
    if (existingRes.rowCount > 0) {
      await client.query('COMMIT');
      return {
        message: 'You already have active digital access to this book',
        access: existingRes.rows[0],
      };
    }

  
    if (userRole !== 'faculty') {
      const activeCountRes = await client.query(
        `SELECT COUNT(*)::int AS count 
         FROM digital_access da
         JOIN users u ON da.user_id = u.id
         WHERE da.book_id = $1 AND da.is_active = TRUE AND u.role != 'faculty'`,
        [bookId]
      );

      if (activeCountRes.rows[0].count >= MAX_CONCURRENT_STUDENTS) {
        throw {
          status: 429,
          message: 'Maximum 30 concurrent readers reached for this book. Try again later.',
        };
      }
    }

    
    const grantRes = await client.query(
      `INSERT INTO digital_access (user_id, book_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '${ACCESS_DAYS} days')
       RETURNING id, user_id, book_id, granted_at, expires_at`,
      [userId, bookId]
    );

    
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'DIGITAL_ACCESS_GRANTED', 'book', $2, $3)`,
      [userId, bookId, JSON.stringify({ role: userRole, expires_at: grantRes.rows[0].expires_at })]
    );

    await client.query('COMMIT');
    return {
      message: `Digital access granted for ${ACCESS_DAYS} days`,
      access: grantRes.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getMyDigitalBooks(userId) {
  const res = await pool.query(
    `SELECT da.id, da.book_id, b.title, b.author, b.category, da.granted_at, da.expires_at
     FROM digital_access da
     JOIN books b ON da.book_id = b.id
     WHERE da.user_id = $1 AND da.is_active = TRUE AND da.expires_at > NOW()
     ORDER BY da.expires_at ASC`,
    [userId]
  );
  return res.rows;
}

module.exports = { requestDigitalAccess, getMyDigitalBooks };