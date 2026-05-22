const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const About = require('../models/About');
const Experience = require('../models/Experience');
const Certification = require('../models/Certification');
const Testimonial = require('../models/Testimonial');
const BlogPost = require('../models/BlogPost');
const auth = require('../middleware/auth');

// GET /api/u/:username — full public portfolio data for a user
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const [skills, projects, about, experience, certifications, testimonials, blogPosts] = await Promise.all([
      Skill.find({ userId: user._id }),
      Project.find({ userId: user._id }).sort({ createdAt: -1 }),
      About.findOne({ userId: user._id }),
      Experience.find({ userId: user._id }).sort({ order: 1, createdAt: -1 }),
      Certification.find({ userId: user._id }).sort({ createdAt: -1 }),
      Testimonial.find({ userId: user._id, approved: true }).sort({ createdAt: -1 }),
      BlogPost.find({ userId: user._id, published: true }).sort({ createdAt: -1 }).select('-content'),
    ]);

    res.json({
      profile: user.profile,
      contact: user.contact,
      username: user.username,
      animationTheme: user.animationTheme || 'cosmic',
      templateConfig: user.templateConfig || {},
      seoConfig:      user.seoConfig     || {},
      sectionOrder:   user.sectionOrder  || ['about','skills','projects','experience','certifications','testimonials','blog','contact'],
      skills,
      projects,
      about: about || null,
      experience,
      certifications,
      testimonials,
      blogPosts,
    });
  } catch (error) {
    console.error('Public portfolio error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PATCH /api/u/settings/template-config — save full template config
router.patch('/settings/template-config', auth, async (req, res) => {
  try {
    const { templateConfig } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { templateConfig },
      { new: true }
    );
    res.json({ templateConfig: user.templateConfig });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PATCH /api/u/settings/theme — update animation theme
router.patch('/settings/theme', auth, async (req, res) => {
  try {
    const { animationTheme } = req.body;
    const validThemes = ['cosmic', 'neon', 'ocean', 'matrix', 'minimal'];
    if (!validThemes.includes(animationTheme)) {
      return res.status(400).json({ message: 'Invalid theme' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { animationTheme },
      { new: true }
    );
    res.json({ animationTheme: user.animationTheme, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PATCH /api/u/settings/username — update username
router.patch('/settings/username', auth, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username required' });

    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length < 3) return res.status(400).json({ message: 'Username must be at least 3 characters' });

    const taken = await User.findOne({ username: clean, _id: { $ne: req.user.id } });
    if (taken) return res.status(400).json({ message: 'Username already taken' });

    const user = await User.findByIdAndUpdate(req.user.id, { username: clean }, { new: true });
    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PATCH /api/u/settings/section-order — save section display order
router.patch('/settings/section-order', auth, async (req, res) => {
  try {
    const { sectionOrder } = req.body;
    if (!Array.isArray(sectionOrder)) return res.status(400).json({ message: 'sectionOrder must be an array' });
    const user = await User.findByIdAndUpdate(req.user.id, { sectionOrder }, { new: true });
    res.json({ sectionOrder: user.sectionOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
