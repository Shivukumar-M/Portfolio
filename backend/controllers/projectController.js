const Project = require('../models/Project');

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title, description, image, githubLink, liveDemo, technologies } = req.body;
    
    const newProject = new Project({
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
};

module.exports = {
  getProjects,
  createProject,
};