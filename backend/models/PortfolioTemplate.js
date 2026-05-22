const mongoose = require('mongoose');

const SectionCfg = new mongoose.Schema(
  { enabled: { type: Boolean, default: true }, order: { type: Number, default: 0 } },
  { _id: false }
);

const PortfolioTemplateSchema = new mongoose.Schema({
  // ── Identity ──────────────────────────────────────────────────────────────────
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  thumbnail:   { type: String, default: '' },   // URL to preview image
  category: {
    type: String,
    enum: ['general', 'creative', 'minimal', 'corporate', 'developer', 'designer'],
    default: 'general',
  },
  tags:     [{ type: String, trim: true }],
  version:  { type: String, default: '1.0' },
  author:   { type: String, default: 'Admin' },
  status:   { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  featured: { type: Boolean, default: false },

  // ── Visual Theme ──────────────────────────────────────────────────────────────
  baseStyle: {
    type: String,
    enum: ['cosmic', 'terminal', 'glass', 'magazine', 'retro'],
    default: 'cosmic',
  },
  colors: {
    primary: { type: String, default: '#a855f7' },
    accent:  { type: String, default: '#06b6d4' },
    bg:      { type: String, default: '#0a0015' },
  },
  font:           { type: String, default: 'Inter' },
  animationSpeed: { type: String, enum: ['none', 'slow', 'normal', 'fast'], default: 'normal' },
  customCSS:      { type: String, default: '' },

  // ── Section Configuration ─────────────────────────────────────────────────────
  sections: {
    home:           { type: SectionCfg, default: () => ({ enabled: true, order: 0 }) },
    about:          { type: SectionCfg, default: () => ({ enabled: true, order: 1 }) },
    experience:     { type: SectionCfg, default: () => ({ enabled: true, order: 2 }) },
    skills:         { type: SectionCfg, default: () => ({ enabled: true, order: 3 }) },
    projects:       { type: SectionCfg, default: () => ({ enabled: true, order: 4 }) },
    certifications: { type: SectionCfg, default: () => ({ enabled: true, order: 5 }) },
    contact:        { type: SectionCfg, default: () => ({ enabled: true, order: 6 }) },
  },

  // ── Stats ──────────────────────────────────────────────────────────────────────
  usageCount: { type: Number, default: 0 },
  previewUrl: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PortfolioTemplateSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PortfolioTemplate', PortfolioTemplateSchema);
