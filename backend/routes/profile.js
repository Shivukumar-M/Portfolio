const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile (authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get public profile (no auth required)
router.get('/public', async (req, res) => {
  try {
    // Get a default public user or the first user
    const user = await User.findOne() || await User.findOne().sort({ createdAt: 1 });
    if (!user) {
      return res.status(404).json({ message: 'No public profile found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const { profile } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profile },
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Update user contact
router.put('/contact', auth, async (req, res) => {
  try {
    const { contact } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { contact },
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;