const express        = require('express');
const router         = express.Router();
const multer         = require('multer');
const path           = require('path');
const fs             = require('fs');
const adminAuth      = require('../middleware/adminAuth');
const authMiddleware = require('../middleware/auth');
const Template       = require('../models/Template');

// ─── File upload setup ────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/templates');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uid = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    cb(null, `${uid}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ['.zip', '.html', '.htm'].includes(ext)
      ? cb(null, true)
      : cb(new Error('Only ZIP or HTML files are allowed'));
  },
});

const parseJ = (v, fb = {}) => {
  if (!v) return fb;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fb; }
};

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/templates  — gallery for users (active only, no filePath)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) {
      const re = { $regex: search, $options: 'i' };
      filter.$or = [{ name: re }, { description: re }, { tags: { $in: [new RegExp(search, 'i')] } }];
    }
    const templates = await Template.find(filter)
      .select('-filePath')
      .sort({ featured: -1, usageCount: -1, createdAt: -1 });
    res.json(templates);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── ADMIN (registered before /:id so static paths don't clash) ───────────────

// GET /api/templates/admin/all
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const templates = await Template.find({}).sort({ createdAt: -1 });
    res.json(templates);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/templates/admin  — create (optional file upload)
router.post('/admin', adminAuth, upload.single('templateFile'), async (req, res) => {
  try {
    const {
      name, description, thumbnail, category, tags, version, author,
      status, featured, sourceType, baseStyle, colors, font,
      animationSpeed, customCSS, sections, previewUrl,
    } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const ext = req.file ? path.extname(req.file.originalname).toLowerCase() : '';
    const src = req.file
      ? (ext === '.html' || ext === '.htm' ? 'html' : 'zip')
      : (sourceType || 'ui-built');

    const template = await Template.create({
      name, description, thumbnail, category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      version, author,
      status:         status    || 'active',
      featured:       featured === true || featured === 'true',
      sourceType:     src,
      filePath:       req.file ? req.file.path         : '',
      fileName:       req.file ? req.file.originalname : '',
      fileSize:       req.file ? req.file.size         : 0,
      baseStyle:      baseStyle || 'cosmic',
      colors:         parseJ(colors, { primary: '#a855f7', accent: '#06b6d4', bg: '#0a0015' }),
      font:           font || 'Inter',
      animationSpeed: animationSpeed || 'normal',
      customCSS:      customCSS || '',
      sections:       parseJ(sections, {}),
      previewUrl:     previewUrl || '',
    });

    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// PUT /api/templates/admin/:id  — update (optional new file)
router.put('/admin/:id', adminAuth, upload.single('templateFile'), async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    const scalar = ['name', 'description', 'thumbnail', 'category', 'version', 'author',
                    'status', 'baseStyle', 'font', 'animationSpeed', 'customCSS', 'previewUrl'];
    scalar.forEach(f => { if (req.body[f] !== undefined) template[f] = req.body[f]; });

    if (req.body.featured !== undefined)
      template.featured = req.body.featured === true || req.body.featured === 'true';
    if (req.body.tags !== undefined)
      template.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : (req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    if (req.body.colors !== undefined)
      template.colors = { ...(template.colors?.toObject?.() || template.colors), ...parseJ(req.body.colors, {}) };
    if (req.body.sections !== undefined)
      template.sections = { ...template.sections, ...parseJ(req.body.sections, {}) };

    if (req.file) {
      if (template.filePath && fs.existsSync(template.filePath)) fs.unlinkSync(template.filePath);
      const ext = path.extname(req.file.originalname).toLowerCase();
      template.sourceType = (ext === '.html' || ext === '.htm') ? 'html' : 'zip';
      template.filePath   = req.file.path;
      template.fileName   = req.file.originalname;
      template.fileSize   = req.file.size;
    }

    await template.save();
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// DELETE /api/templates/admin/:id
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    if (template.filePath && fs.existsSync(template.filePath)) fs.unlinkSync(template.filePath);
    await template.deleteOne();
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /api/templates/admin/:id/status
router.patch('/admin/:id/status', adminAuth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    template.status = req.body.status || (template.status === 'active' ? 'inactive' : 'active');
    await template.save();
    res.json({ _id: template._id, status: template.status });
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /api/templates/admin/:id/featured
router.patch('/admin/:id/featured', adminAuth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    template.featured = !template.featured;
    await template.save();
    res.json({ _id: template._id, featured: template.featured });
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/templates/admin/:id/download  — serve file to admin
router.get('/admin/:id/download', adminAuth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template || !template.filePath)
      return res.status(404).json({ message: 'No file attached to this template' });
    if (!fs.existsSync(template.filePath))
      return res.status(404).json({ message: 'File not found on server' });
    res.download(template.filePath, template.fileName || 'template.zip');
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── PUBLIC /:id  (after all /admin/* routes) ─────────────────────────────────

// GET /api/templates/:id
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).select('-filePath');
    if (!template || template.status === 'inactive')
      return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/templates/:id/use  — authenticated users increment usage
router.post('/:id/use', authMiddleware, async (req, res) => {
  try {
    await Template.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
