const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const sendEmailNotification = async (toEmail, senderName, senderEmail, subject, messageText) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Portfolio Bot" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `New message from ${senderName}: ${subject}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p>${messageText}</p>
      `,
    });
  } catch (err) {
    console.error('Email notification failed:', err.message);
  }
};

// Get all messages for a user (authenticated), sorted newest first
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Mark a message as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Delete a message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Deleted' });
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

    // Email notification: find the target user's email and notify them
    const targetUser = await User.findById(targetUserId).catch(() => null);
    if (targetUser?.email) {
      await sendEmailNotification(targetUser.email, name, email, subject, message);
    }

    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;