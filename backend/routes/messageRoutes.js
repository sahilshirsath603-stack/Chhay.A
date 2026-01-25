const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.query;

    if (!chatId || typeof chatId !== 'string') {
      return res.status(400).json({ message: 'chatId required' });
    }

    const userId = req.userId || req.user.id;
    let query = {};

    if (chatId.includes('-')) {
      // User chat: chatId is "userId1-userId2"
      const [id1, id2] = chatId.split('-').map(id => new mongoose.Types.ObjectId(id));
      query = {
        $or: [
          { senderId: id1, receiverId: id2 },
          { senderId: id2, receiverId: id1 }
        ]
      };
    } else {
      // Group chat: chatId is groupId
      query = {
        receiverId: new mongoose.Types.ObjectId(chatId),
        receiverType: 'group'
      };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });

    return res.json(messages);
  } catch (err) {
    console.error('FINAL MESSAGE FETCH ERROR:', err);
    // Handle CastError by returning empty array to prevent crashes
    if (err.name === 'CastError') {
      console.warn('CastError in message fetch, returning empty array');
      return res.json([]);
    }
    res.status(500).json({ message: 'Message fetch failed' });
  }
});

module.exports = router;
