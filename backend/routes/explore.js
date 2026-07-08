const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Community = require('../models/Community');
const auth = require('../middleware/auth');

// Seed mock data if database is empty
const seedIfNeeded = async () => {
  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    // Seed basic demo data
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    
    const demoUser = await User.create({
      name: 'Demo User',
      username: 'demo_explore',
      email: 'demo@explore.com',
      password: password,
      profilePicture: 'https://i.pravatar.cc/150?u=demo',
      isVerified: true
    });

    await Post.create([
      {
        author: demoUser._id,
        content: 'Welcome to SocialSphere! This is a seeded post. #welcome',
        hashtags: ['welcome'],
        likes: [],
        views: 100
      },
      {
        author: demoUser._id,
        content: 'Check out this amazing photo! #photography',
        image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800',
        hashtags: ['photography'],
        likes: [],
        views: 200
      }
    ]);

    await Community.create({
      name: 'Explore Community',
      description: 'A place to discover new things',
      creator: demoUser._id,
      members: [demoUser._id]
    });
  }
};

// ── GET /api/explore ───────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    await seedIfNeeded();
    
    const trending = await Post.aggregate([
      { $addFields: { score: { $add: [{ $size: { $ifNull: ['$likes', []] } }, { $ifNull: ['$views', 0] }] } } },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);
    await Post.populate(trending, { path: 'author', select: 'name username profilePicture isVerified' });

    const latest = await Post.find().populate('author', 'name username profilePicture isVerified').sort({ createdAt: -1 }).limit(10);
    
    const users = await User.find({ _id: { $ne: req.user.id } }).select('name username profilePicture isVerified bio followers').limit(5);
    
    const communities = await Community.find().limit(5);

    res.json({ trendingPosts: trending, latestPosts: latest, suggestedUsers: users, communities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/explore/trending ──────────────────────────
router.get('/trending', auth, async (req, res) => {
  try {
    const trending = await Post.aggregate([
      { $addFields: { score: { $add: [{ $size: { $ifNull: ['$likes', []] } }, { $ifNull: ['$views', 0] }] } } },
      { $sort: { score: -1 } },
      { $limit: 20 }
    ]);
    await Post.populate(trending, { path: 'author', select: 'name username profilePicture isVerified' });
    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/explore/users/suggestions ─────────────────
router.get('/users/suggestions', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const excludeIds = me ? [...me.following.map(String), req.user.id] : [req.user.id];
    const users = await User.find({ _id: { $nin: excludeIds } })
      .select('name username profilePicture isVerified bio followers')
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/explore/posts/latest ──────────────────────
router.get('/posts/latest', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name username profilePicture isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();
    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
