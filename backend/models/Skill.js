const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  category: {
    type: String,
    enum: ['frontend', 'backend', 'tools', 'other'],
    default: 'other',
  },
  icon: {
    type: String,
    default: 'fas fa-code',
  },
  color: {
    type: String,
    default: 'bg-blue-500',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Skill', SkillSchema);