const express = require('express');
const router = express.Router();
const { createMessage } = require('../controllers/messageController');

// POST a new message
router.post('/', createMessage);

module.exports = router;