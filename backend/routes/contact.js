const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user contact info (authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.contact);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get public contact info (no auth required)
router.get('/public', async (req, res) => {
  try {
    // Get contact info from a default user or the first user
    const defaultUser = await User.findOne() || await User.findOne().sort({ createdAt: 1 });
    if (!defaultUser) {
      return res.json({
        email: 'your.email@example.com',
        phone: '+1 (123) 456-7890',
        location: 'Your City, Country',
      });
    }
    res.json(defaultUser.contact);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Update user contact info
router.put('/', auth, async (req, res) => {
  try {
    const { contact } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { contact },
      { new: true }
    );
    
    res.json(user.contact);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;