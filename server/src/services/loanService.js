const pool = require('../db/pool');

const RESERVATION_HOURS = 24; 
const LOAN_DAYS = 7;         
const OVERDUE_FINE = 100;     

async function releaseExpiredReservations(client) {
  const expired = await client.query(
    `UPDATE physical_loans
     SET status = 'expired'
     WHERE status = 'reserved' AND pickup_deadline <= NOW()
     RETURNING copy_id`
  );

  if (expired.rowCount > 0) {
    const copyIds = expired.rows.map((r) => r.copy_id);
    await client.query(
      `UPDATE book_copies SET status = 'available' WHERE id = ANY($1::int[])`,
      [copyIds]
    );
  }
}


async function reserveBookCopy(userId, bookId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await releaseExpiredReservations(client);

    
    const existing = await client.query(
      `SELECT id FROM physical_loans
       WHERE user_id = $1 AND book_id = $2 AND status IN ('reserved', 'borrowed')`,
      [userId, bookId]
    );
    if (existing.rowCount > 0) {
      throw { status: 409, message: 'You already have an active reservation or loan for this book' };
    }

   
    const copyRes = await client.query(
      `SELECT id, copy_number FROM book_copies
       WHERE book_id = $1 AND status = 'available'
       ORDER BY copy_number ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      [bookId]
    );

    if (copyRes.rowCount === 0) {
      throw { status: 409, message: 'No physical copies are currently available for booking' };
    }

    const copy = copyRes.rows[0];

    await client.query(
      `UPDATE book_copies SET status = 'reserved' WHERE id = $1`,
      [copy.id]
    );

    const loanRes = await client.query(
      `INSERT INTO physical_loans (user_id, book_id, copy_id, status, pickup_deadline)
       VALUES ($1, $2, $3, 'reserved', NOW() + INTERVAL '${RESERVATION_HOURS} hours')
       RETURNING id, user_id, book_id, copy_id, status, reserved_at, pickup_deadline`,
      [userId, bookId, copy.id]
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'PHYSICAL_BOOK_RESERVED', 'physical_loan', $2, $3)`,
      [userId, loanRes.rows[0].id, JSON.stringify({ book_id: bookId, copy_id: copy.id })]
    );

    await client.query('COMMIT');
    return {
      message: 'Book reserved! Please collect it from the library within 24 hours.',
      loan: loanRes.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


async function issueReservedBook(staffId, loanId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await releaseExpiredReservations(client);

    const loanRes = await client.query(
      `SELECT id, user_id, book_id, copy_id, status FROM physical_loans WHERE id = $1 FOR UPDATE`,
      [loanId]
    );
    const loan = loanRes.rows[0];

    if (!loan) throw { status: 404, message: 'Reservation not found' };
    if (loan.status !== 'reserved') {
      throw { status: 400, message: `Cannot issue book with status: ${loan.status}` };
    }

    await client.query(`UPDATE book_copies SET status = 'borrowed' WHERE id = $1`, [loan.copy_id]);

    const updated = await client.query(
      `UPDATE physical_loans
       SET status = 'borrowed', borrowed_at = NOW(), due_date = NOW() + INTERVAL '${LOAN_DAYS} days'
       WHERE id = $1
       RETURNING *`,
      [loanId]
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'PHYSICAL_BOOK_ISSUED', 'physical_loan', $2, $3)`,
      [staffId, loanId, JSON.stringify({ borrower_id: loan.user_id })]
    );

    await client.query('COMMIT');
    return { message: 'Book issued for 7 days', loan: updated.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


async function returnBorrowedBook(staffId, loanId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const loanRes = await client.query(
      `SELECT id, user_id, copy_id, status, (NOW() > due_date) AS is_overdue
       FROM physical_loans WHERE id = $1 FOR UPDATE`,
      [loanId]
    );
    const loan = loanRes.rows[0];

    if (!loan) throw { status: 404, message: 'Loan record not found' };
    if (loan.status !== 'borrowed') {
      throw { status: 400, message: `Book is not currently borrowed (status: ${loan.status})` };
    }

    const fineAmount = loan.is_overdue ? OVERDUE_FINE : 0;

    await client.query(`UPDATE book_copies SET status = 'available' WHERE id = $1`, [loan.copy_id]);

    const updated = await client.query(
      `UPDATE physical_loans
       SET status = 'returned', returned_at = NOW(), fine_amount = $1
       WHERE id = $2
       RETURNING *`,
      [fineAmount, loanId]
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'PHYSICAL_BOOK_RETURNED', 'physical_loan', $2, $3)`,
      [staffId, loanId, JSON.stringify({ fine_amount: fineAmount })]
    );

    await client.query('COMMIT');
    return {
      message: fineAmount > 0 ? `Book returned with ${fineAmount} BDT overdue fine` : 'Book returned on time',
      loan: updated.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getMyLoans(userId) {
  const res = await pool.query(
    `SELECT pl.*, b.title, b.author, bc.copy_number,
            CASE WHEN pl.status = 'borrowed' AND NOW() > pl.due_date THEN 100 ELSE pl.fine_amount END AS current_fine
     FROM physical_loans pl
     JOIN books b ON pl.book_id = b.id
     JOIN book_copies bc ON pl.copy_id = bc.id
     WHERE pl.user_id = $1
     ORDER BY pl.reserved_at DESC`,
    [userId]
  );
  return res.rows;
}

async function getAllActiveLoans() {
  const res = await pool.query(
    `SELECT pl.*, u.name AS user_name, u.email AS user_email, b.title, bc.copy_number
     FROM physical_loans pl
     JOIN users u ON pl.user_id = u.id
     JOIN books b ON pl.book_id = b.id
     JOIN book_copies bc ON pl.copy_id = bc.id
     WHERE pl.status IN ('reserved', 'borrowed')
     ORDER BY pl.reserved_at ASC`
  );
  return res.rows;
}

module.exports = {
  reserveBookCopy,
  issueReservedBook,
  returnBorrowedBook,
  getMyLoans,
  getAllActiveLoans,
};