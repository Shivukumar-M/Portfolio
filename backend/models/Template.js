const mongoose = require('mongoose');

const SectionCfg = new mongoose.Schema(
  { enabled: { type: Boolean, default: true }, order: { type: Number, default: 0 } },
  { _id: false }
);

const TemplateSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────────────────────────────────
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  thumbnail:   { type: String, default: '' },
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

  // ── Source ───────────────────────────────────────────────────────────────────
  sourceType: {
    type: String,
    enum: ['ui-built', 'zip', 'html', 'react'],
    default: 'ui-built',
  },
  filePath: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },

  // ── Visual Theme ─────────────────────────────────────────────────────────────
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
  previewUrl:     { type: String, default: '' },

  // ── Section Configuration ─────────────────────────────────────────────────────
  sections: {
    home:           { type: SectionCfg, default: () => ({ enabled: true,  order: 0  }) },
    about:          { type: SectionCfg, default: () => ({ enabled: true,  order: 1  }) },
    skills:         { type: SectionCfg, default: () => ({ enabled: true,  order: 2  }) },
    projects:       { type: SectionCfg, default: () => ({ enabled: true,  order: 3  }) },
    experience:     { type: SectionCfg, default: () => ({ enabled: true,  order: 4  }) },
    education:      { type: SectionCfg, default: () => ({ enabled: false, order: 5  }) },
    certifications: { type: SectionCfg, default: () => ({ enabled: true,  order: 6  }) },
    services:       { type: SectionCfg, default: () => ({ enabled: false, order: 7  }) },
    testimonials:   { type: SectionCfg, default: () => ({ enabled: false, order: 8  }) },
    blog:           { type: SectionCfg, default: () => ({ enabled: false, order: 9  }) },
    contact:        { type: SectionCfg, default: () => ({ enabled: true,  order: 10 }) },
    footer:         { type: SectionCfg, default: () => ({ enabled: true,  order: 11 }) },
  },

  // ── Stats ────────────────────────────────────────────────────────────────────
  usageCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TemplateSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Template', TemplateSchema);
