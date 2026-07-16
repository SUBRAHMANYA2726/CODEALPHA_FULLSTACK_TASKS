const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Community = require('../models/Community');

// Global Search API
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [], posts: [], communities: [] });
    
    const regex = new RegExp(q, 'i');
    
    const users = await User.find({ 
      $or: [{ name: regex }, { username: regex }] 
    }).select('name username profilePicture').limit(5);
    
    const posts = await Post.find({ content: regex })
      .populate('author', 'name username profilePicture')
      .limit(5);
      
    const communities = await Community.find({ 
      $or: [{ name: regex }, { description: regex }] 
    }).limit(5);
    
    res.json({ users, posts, communities });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error });
  }
});

module.exports = router;
