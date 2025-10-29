const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Get all projects for a user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Add a new project
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, image, githubLink, liveDemo, technologies } = req.body;
    
    const newProject = new Project({
      userId: req.user.id,
      title,
      description,
      image,
      githubLink,
      liveDemo,
      technologies,
    });
    
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Update a project
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, image, githubLink, liveDemo, technologies } = req.body;
    
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, image, githubLink, liveDemo, technologies },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Delete a project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;