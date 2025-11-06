const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  current: {
    type: Boolean,
    default: false,
  }
});

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
});

const aboutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  story: {
    intro: String,
    skills: String,
    hobbies: String
  },
  experiences: [experienceSchema],
  education: [educationSchema],
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('About', aboutSchema);