const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Experience = require('../models/Experience');

// GET all entries for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Experience.find({ userId: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST create entry
router.post('/', auth, async (req, res) => {
  try {
    const entry = new Experience({ userId: req.user.id, ...req.body });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT update entry
router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await Experience.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE entry
router.delete('/:id', auth, async (req, res) => {
  try {
    await Experience.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
