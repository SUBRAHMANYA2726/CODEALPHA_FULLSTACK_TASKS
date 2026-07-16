const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const auth = require('../middleware/auth');

// Get all communities (for mockup feed)
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find().limit(20);
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create community
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const community = new Community({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id],
      admins: [req.user.id]
    });
    await community.save();
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
