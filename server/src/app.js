require('dotenv').config();
const express = require('express');
const pool = require('./db/pool');
const booksRouter = require('./routes/books');
const authRouter = require('./routes/auth');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
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

const digitalRouter = require('./routes/digital');
app.use('/api/digital', digitalRouter);

const notesRouter = require('./routes/notes');
app.use('/api/notes', notesRouter);

const loansRouter = require('./routes/loans');
app.use('/api/loans', loansRouter);