const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  portfolioUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  projectType: { type: String, enum: ['full-time', 'contract', 'freelance', 'consulting', 'other'], default: 'other' },
  budget:      { type: String, default: '' },
  message:     { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', LeadSchema);
