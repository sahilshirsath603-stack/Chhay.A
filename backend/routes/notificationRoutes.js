const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// Get all notifications for the current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .populate('from', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark all notifications as read for current user
router.put('/read', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error marking notifications as read:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete all notifications for current user
router.delete('/', authMiddleware, async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user._id });
        res.json({ message: "All notifications deleted" });
    } catch (err) {
        console.error("Error deleting notifications:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
