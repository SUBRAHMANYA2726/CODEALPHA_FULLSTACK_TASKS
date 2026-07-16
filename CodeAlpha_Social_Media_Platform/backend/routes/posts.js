const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// ── GET feed (paginated) ──────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name username profilePicture isVerified')
      .populate({ path: 'comments', options: { limit: 3 }, populate: { path: 'author', select: 'name username profilePicture' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();
    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET trending posts ────────────────────────────────
router.get('/trending', async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $addFields: { score: { $add: [{ $size: '$likes' }, { $multiply: [{ $size: '$comments' }, 2] }, { $ifNull: ['$views', 0] }] } } },
      { $sort: { score: -1 } },
      { $limit: 20 }
    ]);
    await Post.populate(posts, { path: 'author', select: 'name username profilePicture isVerified' });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET single post ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username profilePicture isVerified bio')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name username profilePicture' } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CREATE post ───────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      author: req.user.id,
      content: req.body.content,
      image: req.body.image,
      video: req.body.video,
      hashtags: req.body.hashtags || []
    });
    const saved = await post.save();
    await saved.populate('author', 'name username profilePicture isVerified');

    const io = req.app.get('io');
    if (io) io.emit('new_post', saved);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── UPDATE post ───────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    post.content = req.body.content ?? post.content;
    post.hashtags = req.body.hashtags ?? post.hashtags;
    await post.save();
    await post.populate('author', 'name username profilePicture isVerified');
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE post ───────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── LIKE / UNLIKE ─────────────────────────────────────
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user.id);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
      // Create notification (don't notify self)
      if (post.author.toString() !== req.user.id) {
        await Notification.create({ recipient: post.author, sender: req.user.id, type: 'like', post: post._id });
        const io = req.app.get('io');
        if (io) io.to(post.author.toString()).emit('notification', { type: 'like' });
      }
    }
    await post.save();
    res.json({ liked: !alreadyLiked, likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── BOOKMARK / UNBOOKMARK ─────────────────────────────
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const postId = req.params.id;

    const isBookmarked = user.bookmarks.map(String).includes(postId);
    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId);
    } else {
      user.bookmarks.push(postId);
    }
    await user.save();
    res.json({ bookmarked: !isBookmarked, total: user.bookmarks.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET bookmarked posts ──────────────────────────────
router.get('/user/bookmarks', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name username profilePicture isVerified' }
    });
    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADD comment ───────────────────────────────────────
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({ author: req.user.id, post: req.params.id, text: req.body.text });
    post.comments.push(comment._id);
    await post.save();
    await comment.populate('author', 'name username profilePicture');

    // Notification
    if (post.author.toString() !== req.user.id) {
      await Notification.create({ recipient: post.author, sender: req.user.id, type: 'comment', post: post._id, comment: comment._id });
      const io = req.app.get('io');
      if (io) io.to(post.author.toString()).emit('notification', { type: 'comment' });
    }
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET comments ──────────────────────────────────────
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: 'comments',
      populate: [{ path: 'author', select: 'name username profilePicture' }, { path: 'replies', populate: { path: 'author', select: 'name username profilePicture' } }]
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE comment ────────────────────────────────────
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: comment._id } });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted', id: req.params.commentId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── REPLY to comment ──────────────────────────────────
router.post('/comments/:commentId/reply', auth, async (req, res) => {
  try {
    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) return res.status(404).json({ message: 'Comment not found' });

    const reply = await Comment.create({ author: req.user.id, post: parentComment.post, text: req.body.text });
    parentComment.replies.push(reply._id);
    await parentComment.save();
    await reply.populate('author', 'name username profilePicture');
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── VIEW increment ────────────────────────────────────
router.post('/:id/view', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
