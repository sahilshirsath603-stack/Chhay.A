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

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

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
