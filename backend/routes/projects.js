const express = require('express');
const router = express.Router();
const { getProjects, createProject } = require('../controllers/projectController');

// GET all projects
router.get('/', getProjects);

// POST a new project
router.post('/', createProject);

module.exports = router;