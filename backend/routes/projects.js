const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

/* ========================================================
   ✅ GET all projects for a logged-in user
======================================================== */
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

/* ========================================================
   ✅ GET public (default) projects — no auth needed
======================================================== */
router.get('/public', async (req, res) => {
  try {
    const defaultUser = await User.findOne().sort({ createdAt: 1 });

    // ✅ Default fallback projects (your real ones)
    const defaultProjects = [
      {
        _id: 'p1',
        title: 'Blog Platform',
        description:
          'A modern blogging platform built with Django, Tailwind CSS, and JavaScript. Allows users to create, edit, and publish blog posts with a beautiful responsive UI.',
        githubLink: 'https://github.com/Shivukumar-M/blog-platform',
        liveDemo: 'https://blog-demo.vercel.app',
        image: '/images/blog.png',
        technologies: ['Django', 'Tailwind CSS', 'JavaScript', 'HTML'],
      },
      {
        _id: 'p2',
        title: 'Gemini AI Bot',
        description:
          'An intelligent chatbot powered by Python Flask and Gemini API, featuring natural language understanding and a responsive Tailwind UI.',
        githubLink: 'https://github.com/Shivukumar-M/gemini-ai-bot',
        liveDemo: 'https://gemini-bot-demo.vercel.app',
        image: '/images/ai.png',
        technologies: ['Python', 'Flask', 'Tailwind CSS', 'JavaScript'],
      },
      {
        _id: 'p3',
        title: 'Portfolio Website',
        description:
          'A personal portfolio built with the MERN stack to showcase projects, skills, and contact information with a smooth UI and admin panel.',
        githubLink: 'https://github.com/Shivukumar-M/mern-portfolio',
        liveDemo: 'https://portfolio-demo.vercel.app',
        image: '/images/portfolio.png',
        technologies: ['MongoDB', 'Express', 'React', 'Node.js'],
      },
    ];

    if (!defaultUser) {
      return res.json(defaultProjects);
    }

    const projects = await Project.find({ userId: defaultUser._id });

    res.json(projects.length ? projects : defaultProjects);
  } catch (error) {
    console.error('Error in /api/projects/public:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

/* ========================================================
   ✅ ADD a new project
======================================================== */
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
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

/* ========================================================
   ✅ UPDATE a project
======================================================== */
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, image, githubLink, liveDemo, technologies } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, description, image, githubLink, liveDemo, technologies },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

/* ========================================================
   ✅ DELETE a project
======================================================== */
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
