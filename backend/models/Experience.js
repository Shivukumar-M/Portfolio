const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['work', 'education'], required: true },
  title: { type: String, required: true },       // Job title or Degree
  organization: { type: String, required: true }, // Company or University
  location: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },         // empty = "Present"
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
  technologies: [{ type: String }],               // For work entries
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Experience', ExperienceSchema);
