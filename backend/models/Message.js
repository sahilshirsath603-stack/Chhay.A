const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiverType: {
      type: String,
      enum: ['user', 'group'],
      default: 'user'
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    chatId: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'file', 'audio'],
      default: 'text'
    },
    fileUrl: {
      type: String,
      default: null
    },
    fileName: {
      type: String,
      default: null
    },
    fileSize: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
