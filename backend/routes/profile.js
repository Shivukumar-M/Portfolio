const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.user.id}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

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

// ✅ PRIVATE: Upload profile photo
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const photoUrl = `/images/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 'profile.photo': photoUrl },
      { new: true }
    );
    res.json({ photoUrl, profile: user.profile });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
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
