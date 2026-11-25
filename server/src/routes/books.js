const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/books?search=&category=&digital=&sort=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { search, category, digital, sort } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const offset = (page - 1) * limit;

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(b.title ILIKE $${values.length} OR b.author ILIKE $${values.length})`);
    }
    if (category) {
      values.push(category);
      conditions.push(`b.category = $${values.length}`);
    }
    if (digital === 'true') {
      conditions.push('b.has_digital = TRUE');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sort: only allow these options (safe from SQL injection)
    const sortOptions = {
      title_asc: 'b.title ASC',
      title_desc: 'b.title DESC',
      author_asc: 'b.author ASC',
      price_asc: 'b.price ASC',
      price_desc: 'b.price DESC',
      newest: 'b.created_at DESC, b.id DESC',
    };
    const orderBy = sortOptions[sort] || 'b.title ASC';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM books b ${where}`,
      values
    );
    const total = Number(countResult.rows[0].count);

    const listValues = [...values, limit, offset];
    const listResult = await pool.query(
      `SELECT b.id, b.title, b.author, b.category, b.isbn, b.has_digital, b.price,
              COUNT(c.id) FILTER (WHERE c.status = 'available') AS available_copies,
              COUNT(c.id) AS total_copies
       FROM books b
       LEFT JOIN book_copies c ON c.book_id = b.id
       ${where}
       GROUP BY b.id
       ORDER BY ${orderBy}
       LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
      listValues
    );

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      books: listResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load books' });
  }
});

// GET /api/books/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT category, COUNT(*) AS count FROM books GROUP BY category ORDER BY category'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  const bookId = Number(req.params.id);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ error: 'Invalid book ID' });
  }

  try {
    const bookResult = await pool.query(
      `SELECT b.id, b.title, b.author, b.category, b.isbn, b.has_digital, b.price,
              COUNT(c.id) FILTER (WHERE c.status = 'available')::int AS available_copies,
              COUNT(c.id)::int AS total_copies
       FROM books b
       LEFT JOIN book_copies c ON c.book_id = b.id
       WHERE b.id = $1
       GROUP BY b.id`,
      [bookId]
    );

    if (bookResult.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const readersResult = await pool.query(
      `SELECT COUNT(*)::int AS active_students
       FROM digital_access da
       JOIN users u ON da.user_id = u.id
       WHERE da.book_id = $1 AND da.is_active = TRUE AND da.expires_at > NOW() AND u.role != 'faculty'`,
      [bookId]
    );

    res.json({
      ...bookResult.rows[0],
      active_student_readers: readersResult.rows[0].active_students,
      max_student_readers: 30,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load book details' });
  }
});

module.exports = router;