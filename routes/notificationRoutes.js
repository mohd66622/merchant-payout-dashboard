const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// ✅ Get all notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add a new notification
router.post('/', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const newNotification = new Notification({ userId, message });
    await newNotification.save();
    res.status(201).json({ message: 'Notification created', notification: newNotification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
