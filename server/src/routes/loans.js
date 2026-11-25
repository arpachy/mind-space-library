const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  reserveBookCopy,
  issueReservedBook,
  returnBorrowedBook,
  getMyLoans,
  getAllActiveLoans,
} = require('../services/loanService');

const router = express.Router();

// POST /api/loans/reserve/:bookId -> Reserve a physical copy 1 day in advance
router.post('/reserve/:bookId', requireAuth, async (req, res) => {
  const bookId = Number(req.params.bookId);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ error: 'Invalid book ID' });
  }

  try {
    const result = await reserveBookCopy(req.user.id, bookId);
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to reserve book' });
  }
});

// GET /api/loans/my -> Get logged-in user's reservations & loans
router.get('/my', requireAuth, async (req, res) => {
  try {
    const loans = await getMyLoans(req.user.id);
    res.json({ loans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load your loans' });
  }
});

// GET /api/loans/manage -> Staff view of all active reservations & loans
router.get('/manage', requireAuth, requireRole('staff'), async (req, res) => {
  try {
    const loans = await getAllActiveLoans();
    res.json({ loans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load active loans' });
  }
});

// POST /api/loans/:loanId/issue -> Staff hands over reserved book (starts 7-day loan)
router.post('/:loanId/issue', requireAuth, requireRole('staff'), async (req, res) => {
  const loanId = Number(req.params.loanId);
  if (!Number.isInteger(loanId) || loanId <= 0) {
    return res.status(400).json({ error: 'Invalid loan ID' });
  }

  try {
    const result = await issueReservedBook(req.user.id, loanId);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to issue book' });
  }
});

// POST /api/loans/:loanId/return -> Staff processes book return & 100 BDT overdue fine
router.post('/:loanId/return', requireAuth, requireRole('staff'), async (req, res) => {
  const loanId = Number(req.params.loanId);
  if (!Number.isInteger(loanId) || loanId <= 0) {
    return res.status(400).json({ error: 'Invalid loan ID' });
  }

  try {
    const result = await returnBorrowedBook(req.user.id, loanId);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to process return' });
  }
});

module.exports = router;