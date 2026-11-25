const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  bookPurchaseWithAdvance,
  completePurchase,
  getMyPurchases,
  getPendingPurchases,
} = require('../services/purchaseService');

const router = express.Router();


router.post('/book/:bookId', requireAuth, async (req, res) => {
  const bookId = Number(req.params.bookId);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ error: 'Invalid book ID' });
  }

  try {
    const result = await bookPurchaseWithAdvance(req.user.id, bookId);
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to book purchase' });
  }
});


router.get('/my', requireAuth, async (req, res) => {
  try {
    const purchases = await getMyPurchases(req.user.id);
    res.json({ purchases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load purchases' });
  }
});


router.get('/pending', requireAuth, requireRole('staff'), async (req, res) => {
  try {
    const purchases = await getPendingPurchases();
    res.json({ purchases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load pending purchases' });
  }
});


router.post('/:purchaseId/complete', requireAuth, requireRole('staff'), async (req, res) => {
  const purchaseId = Number(req.params.purchaseId);
  if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
    return res.status(400).json({ error: 'Invalid purchase ID' });
  }

  try {
    const result = await completePurchase(req.user.id, purchaseId);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to complete purchase' });
  }
});

module.exports = router;