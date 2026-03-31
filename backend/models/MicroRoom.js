const mongoose = require('mongoose');

const microRoomSchema = new mongoose.Schema(
    {
        parentChatId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        expiresAt: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ['burst', 'focus', 'live'],
            default: 'live'
        },
        stats: {
            messageCount: { type: Number, default: 0 },
            peakParticipants: { type: Number, default: 0 },
            reactionCount: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.models.MicroRoom || mongoose.model('MicroRoom', microRoomSchema);
