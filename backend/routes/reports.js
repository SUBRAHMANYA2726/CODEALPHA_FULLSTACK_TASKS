const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');

// Create report
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const report = new Report({
      reporter: req.user.id,
      targetType,
      targetId,
      reason
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports (admin)
router.get('/', auth, async (req, res) => {
  try {
    // Assuming req.user.isAdmin check happens here or in auth middleware
    const reports = await Report.find().populate('reporter', 'name').sort('-createdAt');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
