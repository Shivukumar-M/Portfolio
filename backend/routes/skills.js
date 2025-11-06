const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ Get all skills for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user.id });
    res.json(skills);
  } catch (error) {
    console.error('Error in GET /api/skills:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ✅ Public default skills route
router.get('/public', async (req, res) => {
  try {
    const defaultUser = await User.findOne().sort({ createdAt: 1 });
    const skills = defaultUser
      ? await Skill.find({ userId: defaultUser._id })
      : [];

    // ✅ Return default data if no user or no skills found
    const fallbackSkills = [
      { name: 'Python', level: 90, icon: '/images/python.png', color: 'bg-yellow-500', category: 'backend' },
      { name: 'React', level: 85, icon: '/images/react.png', color: 'bg-blue-500', category: 'frontend' },
      { name: 'Django', level: 80, icon: '/images/django.png', color: 'bg-green-500', category: 'backend' },
      { name: 'Flask', level: 75, icon: '/images/flask.png', color: 'bg-slate-500', category: 'backend' },
      { name: 'MongoDB', level: 75, icon: '/images/mongo.png', color: 'bg-green-600', category: 'backend' },
      { name: 'HTML', level: 90, icon: '/images/html.png', color: 'bg-orange-500', category: 'frontend' },
      { name: 'CSS', level: 85, icon: '/images/css.png', color: 'bg-blue-400', category: 'frontend' },
      { name: 'Git & GitHub', level: 80, icon: '/images/github.jpg', color: 'bg-red-500', category: 'tools' },
    ];

    res.json(skills.length ? skills : fallbackSkills);
  } catch (error) {
    console.error('Error in GET /api/skills/public:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ✅ Add new skill
router.post('/', auth, async (req, res) => {
  try {
    const { name, level, icon, color, category } = req.body;
    const newSkill = new Skill({
      userId: req.user.id,
      name,
      level,
      icon,
      color,
      category,
    });
    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ✅ Update skill
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, level, icon, color, category } = req.body;
    const updatedSkill = await Skill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, level, icon, color, category },
      { new: true }
    );
    if (!updatedSkill) return res.status(404).json({ message: 'Skill not found' });
    res.json(updatedSkill);
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// ✅ Delete skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
