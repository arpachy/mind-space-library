const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const { getUserNotes, createNote, updateNote, deleteNote } = require('../services/noteService');

const router = express.Router();

const noteSchema = z.object({
  bookId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().trim().min(1, 'Content is required'),
});

// GET /api/notes?bookId= -> Get logged-in user's private notes
router.get('/', requireAuth, async (req, res) => {
  const bookId = req.query.bookId ? Number(req.query.bookId) : null;
  try {
    const notes = await getUserNotes(req.user.id, bookId);
    res.json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load notes' });
  }
});

// POST /api/notes -> Create a private note
router.post('/', requireAuth, async (req, res) => {
  const parsed = noteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const note = await createNote(req.user.id, parsed.data);
    res.status(201).json({ note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id -> Update own private note
router.put('/:id', requireAuth, async (req, res) => {
  const noteId = Number(req.params.id);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  const parsed = noteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const note = await updateNote(req.user.id, noteId, parsed.data);
    res.json({ note });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id -> Delete own private note
router.delete('/:id', requireAuth, async (req, res) => {
  const noteId = Number(req.params.id);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  try {
    await deleteNote(req.user.id, noteId);
    res.json({ ok: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;