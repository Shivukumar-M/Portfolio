const express  = require('express');
const router   = express.Router();
const adminAuth = require('../middleware/adminAuth');
const authMiddleware = require('../middleware/auth');
const PortfolioTemplate = require('../models/PortfolioTemplate');

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/portfolio-templates  ── all active templates (gallery for users)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const templates = await PortfolioTemplate.find(filter)
      .sort({ featured: -1, usageCount: -1, createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/portfolio-templates/:id  ── single template
router.get('/:id', async (req, res) => {
  try {
    const template = await PortfolioTemplate.findById(req.params.id);
    if (!template || template.status === 'inactive') {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/portfolio-templates/:id/use  ── increment usage count (authenticated user)
router.post('/:id/use', authMiddleware, async (req, res) => {
  try {
    await PortfolioTemplate.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── ADMIN CRUD ───────────────────────────────────────────────────────────────

// GET /api/portfolio-templates/admin/all  ── all templates including drafts/inactive
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const templates = await PortfolioTemplate.find({}).sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/portfolio-templates/admin  ── create
router.post('/admin', adminAuth, async (req, res) => {
  try {
    const {
      name, description, thumbnail, category, tags, version, author,
      status, featured, baseStyle, colors, font, animationSpeed,
      customCSS, sections, previewUrl,
    } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const template = await PortfolioTemplate.create({
      name, description, thumbnail, category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      version, author, status: status || 'active',
      featured: featured || false,
      baseStyle: baseStyle || 'cosmic',
      colors: colors || {},
      font: font || 'Inter',
      animationSpeed: animationSpeed || 'normal',
      customCSS: customCSS || '',
      sections: sections || {},
      previewUrl: previewUrl || '',
    });

    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// PUT /api/portfolio-templates/admin/:id  ── update
router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const {
      name, description, thumbnail, category, tags, version, author,
      status, featured, baseStyle, colors, font, animationSpeed,
      customCSS, sections, previewUrl,
    } = req.body;

    const template = await PortfolioTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    if (name)        template.name        = name;
    if (description !== undefined) template.description = description;
    if (thumbnail   !== undefined) template.thumbnail   = thumbnail;
    if (category)    template.category    = category;
    if (tags !== undefined) template.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    if (version)     template.version     = version;
    if (author)      template.author      = author;
    if (status)      template.status      = status;
    if (featured !== undefined) template.featured = featured;
    if (baseStyle)   template.baseStyle   = baseStyle;
    if (colors)      template.colors      = { ...template.colors, ...colors };
    if (font)        template.font        = font;
    if (animationSpeed) template.animationSpeed = animationSpeed;
    if (customCSS !== undefined) template.customCSS = customCSS;
    if (sections)    template.sections    = { ...template.sections, ...sections };
    if (previewUrl  !== undefined) template.previewUrl = previewUrl;

    await template.save();
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// DELETE /api/portfolio-templates/admin/:id
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const template = await PortfolioTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    await template.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /api/portfolio-templates/admin/:id/status  ── cycle status
router.patch('/admin/:id/status', adminAuth, async (req, res) => {
  try {
    const template = await PortfolioTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    const { status } = req.body;
    template.status = status || (template.status === 'active' ? 'inactive' : 'active');
    await template.save();
    res.json({ _id: template._id, status: template.status });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /api/portfolio-templates/admin/:id/featured  ── toggle featured
router.patch('/admin/:id/featured', adminAuth, async (req, res) => {
  try {
    const template = await PortfolioTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    template.featured = !template.featured;
    await template.save();
    res.json({ _id: template._id, featured: template.featured });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
