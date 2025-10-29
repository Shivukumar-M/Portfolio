const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

// Get all skills for a user (authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user.id });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get public skills (no auth required)
router.get('/public', async (req, res) => {
  try {
    // Get skills from a default user or the first user
    const defaultUser = await User.findOne() || await User.findOne().sort({ createdAt: 1 });
    if (!defaultUser) {
      return res.json([]);
    }
    const skills = await Skill.find({ userId: defaultUser._id });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Add a new skill
router.post('/', auth, async (req, res) => {
  try {
    const { name, level, category, icon, color } = req.body;
    
    const newSkill = new Skill({
      userId: req.user.id,
      name,
      level,
      category,
      icon,
      color,
    });
    
    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Update a skill
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, level, category, icon, color } = req.body;
    
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, level, category, icon, color },
      { new: true }
    );
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Delete a skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json({ message: 'Skill removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;