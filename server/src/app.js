require('dotenv').config();
const express = require('express');
const pool = require('./db/pool');
const booksRouter = require('./routes/books');

const app = express();
app.use(express.json());
app.use('/api/books', booksRouter);

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});