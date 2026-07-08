const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // General saves
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],  // Premium bookmarks feature
  stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
  settings: {
    theme: { type: String, default: 'system', enum: ['light', 'dark', 'system'] },
    notifications: { type: Boolean, default: true },
    privacy: { type: String, default: 'public', enum: ['public', 'private'] }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
