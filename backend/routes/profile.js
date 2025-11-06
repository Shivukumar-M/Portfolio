const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ PRIVATE: Get authenticated user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ✅ PUBLIC: Return default static profile (no DB)
router.get('/public', async (req, res) => {
  try {
    return res.json({
      profile: {
        name: 'Shivukumar A M',
        title: 'Full Stack Developer',
        bio: 'Passionate about building efficient, scalable web applications using modern technologies like React, Node.js, and MongoDB.',
        photo: '/images/github.jpg',
        social: {
          github: 'https://github.com/Shivukumar-M',
          linkedin: 'https://www.linkedin.com/in/shivu-kumar-a-m',
          twitter: '#',
        },
      },
    });
  } catch (error) {
    console.error('Error loading public profile:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ✅ PRIVATE: Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const { profile } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { profile }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ✅ PRIVATE: Update user contact
router.put('/contact', auth, async (req, res) => {
  try {
    const { contact } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { contact }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
