const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: function () { return [this.createdBy]; }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Helper method to check if a user is an admin of the group
groupSchema.statics.isAdmin = function (userId, group) {
  // Check if user is in admins array
  if (group.admins && group.admins.length > 0) {
    return group.admins.some(admin => admin.toString() === userId.toString());
  }
  // Fallback: if admins array is empty, treat group creator as admin
  return group.createdBy.toString() === userId.toString();
};

module.exports = mongoose.models.Group || mongoose.model('Group', groupSchema);
