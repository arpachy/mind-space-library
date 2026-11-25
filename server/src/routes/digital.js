const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requestDigitalAccess, getMyDigitalBooks } = require('../services/digitalService');

const router = express.Router();


router.post('/access/:bookId', requireAuth, async (req, res) => {
  const bookId = Number(req.params.bookId);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ error: 'Invalid book ID' });
  }

  try {
    const result = await requestDigitalAccess(req.user.id, req.user.role, bookId);
    res.status(200).json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to grant digital access' });
  }
});


router.get('/my-books', requireAuth, async (req, res) => {
  try {
    const books = await getMyDigitalBooks(req.user.id);
    res.json({ books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch digital books' });
  }
});

module.exports = router;