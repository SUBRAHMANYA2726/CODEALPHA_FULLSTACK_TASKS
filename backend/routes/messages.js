const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// ── GET conversation between two users ────────────────
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'name username profilePicture')
    .populate('receiver', 'name username profilePicture')
    .sort({ createdAt: 1 })
    .limit(100);

    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET all conversations (inbox) ─────────────────────
router.get('/inbox', auth, async (req, res) => {
  try {
    // Get last message per conversation
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .populate('sender', 'name username profilePicture isOnline')
    .populate('receiver', 'name username profilePicture isOnline')
    .sort({ createdAt: -1 });

    // Deduplicate by conversation partner
    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const partnerId = msg.sender._id.toString() === req.user.id
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        const unread = await Message.countDocuments({ sender: partnerId, receiver: req.user.id, isRead: false });
        conversations.push({
          partner: msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender,
          lastMessage: msg,
          unread
        });
      }
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SEND message (REST fallback) ──────────────────────
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, text, media, mediaType } = req.body;
    const message = await Message.create({
      sender: req.user.id, receiver: receiverId, text, media, mediaType
    });
    await message.populate('sender', 'name username profilePicture');
    await message.populate('receiver', 'name username profilePicture');

    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('receive_message', message);
      io.to(receiverId).emit('notification', { type: 'message' });
    }
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE message ────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Not found' });
    if (msg.sender.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await msg.deleteOne();
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
