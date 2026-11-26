const pool = require('../db/pool');

async function getUserNotes(userId, bookId = null) {
  if (bookId) {
    const res = await pool.query(
      `SELECT n.id, n.book_id, b.title AS book_title, n.title, n.content, n.updated_at, n.created_at
       FROM private_notes n
       LEFT JOIN books b ON n.book_id = b.id
       WHERE n.user_id = $1 AND n.book_id = $2
       ORDER BY n.updated_at DESC`,
      [userId, bookId]
    );
    return res.rows;
  }

  const res = await pool.query(
    `SELECT n.id, n.book_id, b.title AS book_title, n.title, n.content, n.updated_at, n.created_at
     FROM private_notes n
     LEFT JOIN books b ON n.book_id = b.id
     WHERE n.user_id = $1
     ORDER BY n.updated_at DESC`,
    [userId]
  );
  return res.rows;
}

async function createNote(userId, { bookId, title, content }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const res = await client.query(
      `INSERT INTO private_notes (user_id, book_id, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, book_id, title, content, updated_at, created_at`,
      [userId, bookId || null, title, content]
    );
    const note = res.rows[0];

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'NOTE_CREATED', 'private_note', $2, $3)`,
      [userId, note.id, JSON.stringify({ book_id: note.book_id })]
    );

    await client.query('COMMIT');
    return note;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateNote(userId, noteId, { title, content }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

   
    const res = await client.query(
      `UPDATE private_notes
       SET title = $1, content = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, book_id, title, content, updated_at, created_at`,
      [title, content, noteId, userId]
    );

    if (res.rowCount === 0) {
      throw { status: 404, message: 'Note not found or access denied' };
    }

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'NOTE_UPDATED', 'private_note', $2)`,
      [userId, noteId]
    );

    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteNote(userId, noteId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const res = await client.query(
      `DELETE FROM private_notes WHERE id = $1 AND user_id = $2 RETURNING id`,
      [noteId, userId]
    );

    if (res.rowCount === 0) {
      throw { status: 404, message: 'Note not found or access denied' };
    }

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'NOTE_DELETED', 'private_note', $2)`,
      [userId, noteId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getUserNotes, createNote, updateNote, deleteNote };