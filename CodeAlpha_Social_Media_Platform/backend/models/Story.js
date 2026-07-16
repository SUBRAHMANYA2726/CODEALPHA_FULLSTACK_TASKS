const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  media: { type: String, required: true }, // Image or Video URL
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours (86400 seconds)
});

module.exports = mongoose.model('Story', storySchema);
