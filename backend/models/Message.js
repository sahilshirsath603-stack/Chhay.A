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
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MicroRoom',
      default: null
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
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
    },
    reactions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      emoji: {
        type: String,
        required: true
      }
    }]
  },
  { timestamps: true }
);

// Indexes for performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ chatId: 1 });
messageSchema.index({ roomId: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
