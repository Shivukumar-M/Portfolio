const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorTitle: { type: String, default: '' },
  authorCompany: { type: String, default: '' },
  authorPhoto: { type: String, default: '' },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
