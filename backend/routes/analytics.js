const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const Project = require('../models/Project');
const BlogPost = require('../models/BlogPost');

// Public: track a visit
router.post('/track/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Visitor.create({
      portfolioUserId: user._id,
      page: req.body.page || '/',
      referrer: req.headers.referer || req.body.referrer || '',
      userAgent: req.headers['user-agent'] || '',
      sessionId: req.body.sessionId || '',
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: get analytics summary
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo  = new Date(now -  7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [total, last30, last7, todayCount, pageBreakdown] = await Promise.all([
      Visitor.countDocuments({ portfolioUserId: userId }),
      Visitor.countDocuments({ portfolioUserId: userId, visitedAt: { $gte: thirtyDaysAgo } }),
      Visitor.countDocuments({ portfolioUserId: userId, visitedAt: { $gte: sevenDaysAgo } }),
      Visitor.countDocuments({ portfolioUserId: userId, visitedAt: { $gte: today } }),
      Visitor.aggregate([
        { $match: { portfolioUserId: userId, visitedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Daily visits for last 7 days chart
    const dailyRaw = await Visitor.aggregate([
      { $match: { portfolioUserId: userId, visitedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ total, last30, last7, today: todayCount, pageBreakdown, daily: dailyRaw });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: get activity heatmap data (last 12 months)
router.get('/heatmap', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const [projects, posts] = await Promise.all([
      Project.find({ userId, createdAt: { $gte: yearAgo } }).select('createdAt'),
      BlogPost.find({ userId, createdAt: { $gte: yearAgo } }).select('createdAt'),
    ]);

    // Aggregate by date string
    const counts = {};
    const fmt = d => d.toISOString().slice(0, 10);
    [...projects, ...posts].forEach(doc => {
      const day = fmt(doc.createdAt);
      counts[day] = (counts[day] || 0) + 1;
    });

    const data = Object.entries(counts).map(([date, count]) => ({ date, count }));
    res.json({ data, total: data.reduce((s, d) => s + d.count, 0) });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
