const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── MongoDB connection ────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ECOM:ECOM@cluster0.1awf5ta.mongodb.net/SOCIAL_MEDIA?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI)
  .catch(err => console.error('MongoDB connection error:', err.message));

// ── Mount routes ──────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/search', require('./routes/search'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/explore', require('./routes/explore'));

// ── Socket.IO ─────────────────────────────────────────
const onlineUsers = new Map(); // userId → socketId

io.on('connection', (socket) => {
  // User joins their room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }
  });

  // Private message
  socket.on('send_message', async (data) => {
    try {
      const Message = require('./models/Message');
      const message = await Message.create({
        sender: data.senderId,
        receiver: data.receiverId,
        text: data.text,
        media: data.media,
        mediaType: data.mediaType
      });
      await message.populate('sender', 'name username profilePicture');
      await message.populate('receiver', 'name username profilePicture');

      // Deliver to receiver
      io.to(data.receiverId).emit('receive_message', message);
      // Confirm to sender
      socket.emit('message_sent', message);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('typing', { senderId: data.senderId, isTyping: data.isTyping });
  });

  // Read receipt
  socket.on('mark_read', async (data) => {
    try {
      const Message = require('./models/Message');
      await Message.updateMany(
        { sender: data.senderId, receiver: data.receiverId, isRead: false },
        { $set: { isRead: true } }
      );
      socket.to(data.senderId).emit('messages_read', { by: data.receiverId });
    } catch (err) { }
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// Make io accessible in routes
app.set('io', io);

// ── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Start server ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT);
