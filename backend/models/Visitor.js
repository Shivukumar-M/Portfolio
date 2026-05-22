const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  portfolioUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  page: { type: String, required: true },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  country: { type: String, default: '' },
  sessionId: { type: String, default: '' },
  visitedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visitor', VisitorSchema);
