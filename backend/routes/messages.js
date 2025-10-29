const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all messages for a user (authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;
    
    // If userId is provided, associate the message with that user
    // Otherwise, use a default user (for public portfolio viewing)
    const targetUserId = userId || '647f8b9c8d5f2e4a1c8d4e5a'; // Default user ID
    
    const newMessage = new Message({
      userId: targetUserId,
      name,
      email,
      subject,
      message,
    });
    
    const savedMessage = await newMessage.save();
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;