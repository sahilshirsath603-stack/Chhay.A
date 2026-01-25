const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    about: { type: String, default: 'Hey there! I am using WhatsApp.' },
    avatar: { type: String, default: null },
    lastSeen: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
