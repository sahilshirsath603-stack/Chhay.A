const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true },
    passwordHash: String,
    // Email verification (OTP now stored in Redis via otpService)
    isVerified: { type: Boolean, default: true },  // true keeps existing users active
    // @deprecated - kept as Redis fallback only; otpService is the source of truth
    emailVerifyOTP: { type: String, default: null },
    emailVerifyOTPExpiry: { type: Date, default: null },
    // Password reset (still stored in Mongo for link-based reset)
    passwordResetToken: { type: String, default: null },
    passwordResetExpiry: { type: Date, default: null },
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

// Indexes
userSchema.index({ 'aura.expiresAt': 1 }); // Optimize cron job

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
