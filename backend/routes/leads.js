const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Public: submit a hire-me lead for a portfolio owner
router.post('/submit/:portfolioUserId', async (req, res) => {
  try {
    const { name, email, projectType, budget, message } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    const owner = await User.findById(req.params.portfolioUserId);
    if (!owner) return res.status(404).json({ message: 'Portfolio owner not found' });

    const lead = await Lead.create({
      portfolioUserId: owner._id,
      name,
      email,
      projectType: projectType || 'other',
      budget: budget || '',
      message: message || '',
    });

    // Email notification to portfolio owner
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: owner.contact?.email || owner.email,
          subject: `🎯 New Hire Lead from ${name}`,
          html: `<h2>New Hire Me Lead</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Project Type:</strong> ${projectType}</p>
            <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
            <p><strong>Message:</strong> ${message || 'None'}</p>`,
        });
      } catch { /* non-fatal */ }
    }

    res.status(201).json({ message: 'Lead submitted', lead });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Authenticated: get all leads for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ portfolioUserId: req.user.id }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: delete a lead
router.delete('/:id', auth, async (req, res) => {
  try {
    await Lead.findOneAndDelete({ _id: req.params.id, portfolioUserId: req.user.id });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
