const express = require('express');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/media - Get all media messages for logged-in user or group
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId || req.user.id;
    const { groupId } = req.query;

    let query = {
      type: { $ne: 'text' }
    };

    if (groupId) {
      // For group media, fetch messages sent to the group
      query = {
        ...query,
        receiverType: 'group',
        receiverId: groupId
      };
    } else {
      // For personal media
      query = {
        ...query,
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      };
    }

    const mediaMessages = await Message.find(query).sort({ createdAt: -1 }); // Descending order, latest first

    res.json(mediaMessages);
  } catch (error) {
    console.error('Error fetching media messages:', error);
    res.status(500).json({ error: 'Failed to fetch media messages' });
  }
});

module.exports = router;
