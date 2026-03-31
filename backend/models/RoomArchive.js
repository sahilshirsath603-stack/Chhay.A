const mongoose = require('mongoose');

const roomArchiveSchema = new mongoose.Schema(
    {
        parentChatId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        durationHours: {
            type: Number,
            required: true
        },
        totalMessages: {
            type: Number,
            default: 0
        },
        peakParticipants: {
            type: Number,
            default: 0
        },
        topEmoji: {
            type: String,
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.models.RoomArchive || mongoose.model('RoomArchive', roomArchiveSchema);
