const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const auth = require('../middleware/auth');

// ── GET dashboard stats ───────────────────────────────
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalUsers, totalPosts, pendingReports, totalNotifications] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Report.countDocuments({ status: 'Pending' }),
      Notification.countDocuments()
    ]);

    // Users joined per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const postActivity = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ totalUsers, totalPosts, pendingReports, totalNotifications, userGrowth, postActivity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET all users (paginated) ─────────────────────────
router.get('/users', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { username: new RegExp(search, 'i') }] } : {};

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── TOGGLE admin ──────────────────────────────────────
router.put('/users/:id/toggle-admin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE user (admin) ───────────────────────────────
router.delete('/users/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Post.deleteMany({ author: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET all posts (admin) ─────────────────────────────
router.get('/posts', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().populate('author', 'name username').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments()
    ]);
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE post (admin) ───────────────────────────────
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET reports ───────────────────────────────────────
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await Report.find().populate('reporter', 'name username').sort({ createdAt: -1 }).limit(50);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE report status ──────────────────────────────
router.put('/reports/:id', auth, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status, adminNotes: req.body.notes }, { new: true });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
