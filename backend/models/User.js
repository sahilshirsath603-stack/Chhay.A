const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true },
    passwordHash: String,
    about: { type: String, default: '', maxlength: 120 },
    avatar: { type: String, default: null },
    lastSeen: { type: Date, default: null },
    showOnlineStatus: { type: Boolean, default: true },
    defaultMood: { type: String, default: null },
    interests: [{ type: String }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    aura: {
      type: {
        type: String, // e.g., "focus", "gaming", "hosting"
        default: null
      },
      label: { type: String, default: null },
      color: { type: String, default: null },
      icon: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      visibility: { type: String, enum: ["public", "friends", "private"], default: "public" },
      viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      autoSwitch: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
