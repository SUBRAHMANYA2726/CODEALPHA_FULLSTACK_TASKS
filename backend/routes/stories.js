const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');

// ── GET active stories (last 24h) from followed users ─
router.get('/', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const me = await User.findById(req.user.id);
    const authorIds = [...me.following, req.user.id];

    const stories = await Story.find({
      author: { $in: authorIds },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('author', 'name username profilePicture');

    // Group by author
    const grouped = {};
    for (const story of stories) {
      const id = story.author._id.toString();
      if (!grouped[id]) grouped[id] = { author: story.author, stories: [] };
      grouped[id].stories.push(story);
    }
    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CREATE story ──────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { media, mediaType, content } = req.body;
    if (!media || !mediaType) return res.status(400).json({ message: 'media and mediaType required' });

    const story = await Story.create({ author: req.user.id, media, mediaType, content });
    await story.populate('author', 'name username profilePicture');

    const io = req.app.get('io');
    if (io) io.emit('new_story', story);

    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── VIEW a story ──────────────────────────────────────
router.post('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (!story.views.includes(req.user.id)) {
      story.views.push(req.user.id);
      await story.save();
    }
    res.json({ views: story.views.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE story ──────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Not found' });
    if (story.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
