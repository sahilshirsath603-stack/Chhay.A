const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.patch('/online-status', async (req, res) => {
    try {
        const { showOnlineStatus } = req.body;
        const userId = req.user._id;

        if (typeof showOnlineStatus !== 'boolean') {
            return res.status(400).json({ message: 'showOnlineStatus must be a boolean' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { showOnlineStatus },
            { new: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Emit updated presence info to all connected clients if necessary,
        // but since presence relies on polling /socket emissions, we focus on API responses first.
        // In this implementation, the backend gets truth from DB for new API requests.

        // Let clients know about the change so they immediately update their view
        if (global.io) {
            if (showOnlineStatus) {
                // Determine if they are actually physically online right now
                const { onlineUsers } = require('../sockets/socket');
                const isOnline = onlineUsers.has(userId.toString());
                if (isOnline) {
                    global.io.emit('user-online-status-changed', { userId, online: true, lastSeen: updatedUser.lastSeen });
                }
            } else {
                // Force appear offline to everyone
                global.io.emit('user-offline', { userId, lastSeen: null });
            }
        }

        res.json({ message: 'Privacy settings updated successfully', showOnlineStatus: updatedUser.showOnlineStatus });
    } catch (error) {
        console.error('Error updating online status:', error);
        res.status(500).json({ message: 'Failed to update online status' });
    }
});

module.exports = router;
