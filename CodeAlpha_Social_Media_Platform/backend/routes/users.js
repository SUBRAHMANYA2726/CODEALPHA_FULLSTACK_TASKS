const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// ── UPDATE profile ────────────────────────────────────
router.put('/profile/update', auth, async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'profilePicture', 'coverPhoto', 'username'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET user profile by username ──────────────────────
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ author: user._id })
      .populate('author', 'name username profilePicture isVerified')
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE settings ───────────────────────────────────
router.put('/settings/update', auth, async (req, res) => {
  try {
    const { theme, notifications, privacy } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'settings.theme': theme, 'settings.notifications': notifications, 'settings.privacy': privacy } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET suggested users (people not followed yet) ─────
router.get('/suggestions/list', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const excludeIds = [...me.following.map(String), req.user.id];
    const users = await User.find({ _id: { $nin: excludeIds } })
      .select('name username profilePicture isVerified bio followers')
      .limit(8);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SEARCH users ──────────────────────────────────────
router.get('/search/:query', async (req, res) => {
  try {
    const regex = new RegExp(req.params.query, 'i');
    const users = await User.find({ $or: [{ name: regex }, { username: regex }] })
      .select('name username profilePicture isVerified bio followers')
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE account ────────────────────────────────────
router.delete('/account/delete', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await Post.deleteMany({ author: req.user.id });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN: get all users ──────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET user by ID ────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── FOLLOW / UNFOLLOW ─────────────────────────────────
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself' });

    const target = await User.findById(req.params.id);
    const me = await User.findById(req.user.id);
    if (!target || !me) return res.status(404).json({ message: 'User not found' });

    const isFollowing = me.following.map(String).includes(req.params.id);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });
    } else {
      await User.findByIdAndUpdate(req.user.id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user.id } });
      // Send notification
      await Notification.create({ recipient: req.params.id, sender: req.user.id, type: 'follow' });
      const io = req.app.get('io');
      if (io) io.to(req.params.id).emit('notification', { type: 'follow' });
    }
    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET followers list ────────────────────────────────
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name username profilePicture isVerified bio');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET following list ────────────────────────────────
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name username profilePicture isVerified bio');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET user's bookmarks ──────────────────────────────
router.get('/:id/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name username profilePicture isVerified' }
    });
    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
