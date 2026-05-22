const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Template = require('../models/Template');
const PortfolioDownload = require('../models/PortfolioDownload');
const Visitor = require('../models/Visitor');

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo  = new Date(now -  7 * 24 * 60 * 60 * 1000);
    const today         = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, newUsersLast30, newUsersLast7, newUsersToday,
      totalDownloads, downloadsLast7,
      totalTemplates,
      totalVisitors, visitorsLast7,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: today } }),
      PortfolioDownload.countDocuments(),
      PortfolioDownload.countDocuments({ downloadedAt: { $gte: sevenDaysAgo } }),
      Template.countDocuments({ status: 'active' }),
      Visitor.countDocuments(),
      Visitor.countDocuments({ visitedAt: { $gte: sevenDaysAgo } }),
      User.find({}).select('-password').sort({ createdAt: -1 }).limit(5),
    ]);

    // User registrations per day – last 14 days
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Downloads per day – last 14 days
    const downloadGrowth = await PortfolioDownload.aggregate([
      { $match: { downloadedAt: { $gte: fourteenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$downloadedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Logins per day – last 14 days (approximated by lastLogin field)
    const loginGrowth = await User.aggregate([
      { $match: { lastLogin: { $gte: fourteenDaysAgo, $ne: null } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers, newUsersLast30, newUsersLast7, newUsersToday,
      totalDownloads, downloadsLast7,
      totalTemplates,
      totalVisitors, visitorsLast7,
      recentUsers,
      userGrowth, downloadGrowth, loginGrowth,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).limit(500);

    const userIds = users.map(u => u._id);
    const downloadCounts = await PortfolioDownload.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const dlMap = {};
    downloadCounts.forEach(d => { dlMap[d._id.toString()] = d.count; });

    const result = users.map(u => ({
      ...u.toObject(),
      downloadCount: dlMap[u._id.toString()] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── GET /api/admin/downloads ─────────────────────────────────────────────────
router.get('/downloads', adminAuth, async (req, res) => {
  try {
    const downloads = await PortfolioDownload.find({}).sort({ downloadedAt: -1 }).limit(500);
    res.json(downloads);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── GET /api/admin/downloads/:id/file ───────────────────────────────────────
router.get('/downloads/:id/file', adminAuth, async (req, res) => {
  try {
    const record = await PortfolioDownload.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (!fs.existsSync(record.zipPath)) return res.status(404).json({ message: 'File not found on disk' });
    res.download(record.zipPath, record.fileName || `portfolio_${record.userId}.zip`);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── PATCH /api/admin/users/:id/toggle-admin ─────────────────────────────────
// Rules:
//   • Super admin's role can NEVER be changed by anyone
//   • Only super admin can change another admin's role
//   • Regular admin can only promote a plain user → admin
router.patch('/users/:id/toggle-admin', adminAuth, async (req, res) => {
  try {
    const requestor = req.user;
    const target = await User.findById(req.params.id).select('-password');

    if (!target) return res.status(404).json({ message: 'User not found' });

    // Block changes to super admin account always
    if (target.isSuperAdmin) {
      return res.status(403).json({ message: 'Super Admin role cannot be changed.' });
    }

    // Only super admin can change another admin's role
    if (target.isAdmin && !requestor.isSuperAdmin) {
      return res.status(403).json({ message: 'Only the Super Admin can change another admin\'s role.' });
    }

    target.isAdmin = !target.isAdmin;
    await target.save();
    res.json({ _id: target._id, email: target.email, isAdmin: target.isAdmin, isSuperAdmin: target.isSuperAdmin });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
