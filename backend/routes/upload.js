const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Upload profile picture
router.post('/profile-picture', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const user = await User.findById(req.user.id);
    user.profilePicture = req.file.path;
    await user.save();

    res.json({ imageUrl: req.file.path, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Upload post image
router.post('/post-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ imageUrl: req.file.path });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
