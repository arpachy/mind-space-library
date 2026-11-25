const pool = require('../db/pool');

const PICKUP_HOURS = 48; // 2-day advance booking window

// Release expired purchase bookings (forfeit advance & free up copy)
async function releaseExpiredPurchases(client) {
  const expired = await client.query(
    `UPDATE book_purchases
     SET status = 'cancelled_forfeited'
     WHERE status = 'pending_pickup' AND pickup_deadline <= NOW()
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

// 1. Book a copy for purchase with 50% down payment (2-day pickup deadline)
async function bookPurchaseWithAdvance(userId, bookId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await releaseExpiredPurchases(client);

    const bookRes = await client.query(
      'SELECT id, title, price FROM books WHERE id = $1',
      [bookId]
    );
    const book = bookRes.rows[0];
    if (!book) throw { status: 404, message: 'Book not found' };

    // Lock 1 available physical copy (First-Come-First-Serve)
    const copyRes = await client.query(
      `SELECT id, copy_number FROM book_copies
       WHERE book_id = $1 AND status = 'available'
       ORDER BY copy_number ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      [bookId]
    );

    if (copyRes.rowCount === 0) {
      throw { status: 409, message: 'No physical copies available for purchase' };
    }

    const copy = copyRes.rows[0];
    const totalPrice = Number(book.price);
    const advancePaid = Number((totalPrice * 0.5).toFixed(2));
    const remainingDue = Number((totalPrice - advancePaid).toFixed(2));

    await client.query(
      `UPDATE book_copies SET status = 'reserved' WHERE id = $1`,
      [copy.id]
    );

    const purchaseRes = await client.query(
      `INSERT INTO book_purchases 
         (user_id, book_id, copy_id, total_price, advance_paid, remaining_due, status, pickup_deadline)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending_pickup', NOW() + INTERVAL '${PICKUP_HOURS} hours')
       RETURNING *`,
      [userId, bookId, copy.id, totalPrice, advancePaid, remainingDue]
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'PURCHASE_BOOKED_50_PERCENT', 'book_purchase', $2, $3)`,
      [
        userId,
        purchaseRes.rows[0].id,
        JSON.stringify({ book_id: bookId, copy_id: copy.id, advance_paid: advancePaid }),
      ]
    );

    await client.query('COMMIT');
    return {
      message: `Purchase booked with 50% advance (${advancePaid} BDT). Pay remaining ${remainingDue} BDT at library within 2 days.`,
      purchase: purchaseRes.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// 2. Staff completes purchase upon receiving remaining 50% payment
async function completePurchase(staffId, purchaseId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await releaseExpiredPurchases(client);

    const purchaseRes = await client.query(
      `SELECT id, user_id, copy_id, remaining_due, status
       FROM book_purchases WHERE id = $1 FOR UPDATE`,
      [purchaseId]
    );
    const purchase = purchaseRes.rows[0];

    if (!purchase) throw { status: 404, message: 'Purchase booking not found' };
    if (purchase.status !== 'pending_pickup') {
      throw { status: 400, message: `Cannot complete purchase with status: ${purchase.status}` };
    }

    await client.query(`UPDATE book_copies SET status = 'sold' WHERE id = $1`, [purchase.copy_id]);

    const updated = await client.query(
      `UPDATE book_purchases
       SET status = 'completed', remaining_due = 0, completed_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [purchaseId]
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'PURCHASE_COMPLETED', 'book_purchase', $2, $3)`,
      [staffId, purchaseId, JSON.stringify({ buyer_id: purchase.user_id, collected_due: purchase.remaining_due })]
    );

    await client.query('COMMIT');
    return { message: 'Book purchase completed and handed over!', purchase: updated.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getMyPurchases(userId) {
  const res = await pool.query(
    `SELECT bp.*, b.title, b.author, bc.copy_number
     FROM book_purchases bp
     JOIN books b ON bp.book_id = b.id
     JOIN book_copies bc ON bp.copy_id = bc.id
     WHERE bp.user_id = $1
     ORDER BY bp.booked_at DESC`,
    [userId]
  );
  return res.rows;
}

async function getPendingPurchases() {
  const res = await pool.query(
    `SELECT bp.*, u.name AS user_name, u.email AS user_email, b.title, bc.copy_number
     FROM book_purchases bp
     JOIN users u ON bp.user_id = u.id
     JOIN books b ON bp.book_id = b.id
     JOIN book_copies bc ON bp.copy_id = bc.id
     WHERE bp.status = 'pending_pickup'
     ORDER BY bp.booked_at ASC`
  );
  return res.rows;
}

module.exports = {
  bookPurchaseWithAdvance,
  completePurchase,
  getMyPurchases,
  getPendingPurchases,
};