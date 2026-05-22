const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Testimonial = require('../models/Testimonial');
const User = require('../models/User');

// Public: submit a testimonial for a username
router.post('/submit/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const t = new Testimonial({
      userId: user._id,
      ...req.body,
      approved: false,
    });
    await t.save();
    res.status(201).json({ message: 'Testimonial submitted for review' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: get all testimonials (including pending)
router.get('/', auth, async (req, res) => {
  try {
    const all = await Testimonial.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: approve / reject
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const t = await Testimonial.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { approved: true },
      { new: true }
    );
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Testimonial.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
