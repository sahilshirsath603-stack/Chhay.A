const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');

const onlineUsers = new Set(); // global set of online userIds
const socketIds = new Map(); // userId -> socketId

const initializeSocket = (io) => {
  io.on('connection', async (socket) => {
    try {
      console.log('Socket handshake auth:', socket.handshake.auth);
      const { token } = socket.handshake.auth;
      if (!token) {
        socket.disconnect();
        return;
      }

      let userId;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.error('Invalid token:', err.message);
        socket.disconnect();
        return;
      }

      socket.userId = userId; // Store userId on socket
      onlineUsers.add(userId);
      socketIds.set(userId, socket.id);
      console.log('User connected:', userId);

      // Join user to their group rooms
      const userGroups = await Group.find({ members: userId });
      userGroups.forEach(group => {
        socket.join(`group_${group._id}`);
      });

      // Emit online-users list to the new client
      socket.emit('online-users', Array.from(onlineUsers));

      socket.on(
        'send-message',
        async ({ chatId, text, type, fileUrl, fileName, fileSize }) => {
          if (!chatId) return;

          const [userA, userB] = chatId.split('-');
          const receiverId = new mongoose.Types.ObjectId(userId === userA ? userB : userA);

          const message = await Message.create({
            senderId: userId,
            receiverId,
            chatId,
            text: text || '',
            type: type || 'text',
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
            status: 'sent'
          });

          const receiverSocketId = socketIds.get(receiverId.toString());

          if (receiverSocketId) {
            // Update status to delivered when sending to receiver
            await Message.findByIdAndUpdate(message._id, { status: 'delivered' });
            message.status = 'delivered';
            io.to(receiverSocketId).emit('receive-message', message);
          }

          socket.emit('receive-message', message);
        }
      );

      socket.on('typing', ({ chatId }) => {
        if (!chatId) return;
        const [userA, userB] = chatId.split('-');
        const receiverId = new mongoose.Types.ObjectId(userId === userA ? userB : userA);
        const receiverSocketId = socketIds.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user-typing', { senderId: userId });
        }
      });

      socket.on('stop-typing', ({ chatId }) => {
        if (!chatId) return;
        const [userA, userB] = chatId.split('-');
        const receiverId = new mongoose.Types.ObjectId(userId === userA ? userB : userA);
        const receiverSocketId = socketIds.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user-stop-typing', { senderId: userId });
        }
      });

      socket.on('join-group', ({ groupId }) => {
        if (!groupId) return;
        socket.join(`group_${groupId}`);
        console.log(`User ${userId} joined group group_${groupId}`);
      });

      socket.on('group-message', async ({ groupId, text, type, fileUrl, fileName, fileSize }) => {
        if (!groupId) return;

        const message = await Message.create({
          senderId: userId,
          receiverType: 'group',
          receiverId: groupId,
          chatId: groupId,
          text: text || '',
          type: type || 'text',
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileSize: fileSize || null,
          readBy: [userId] // Sender has read the message
        });

        io.to(`group_${groupId}`).emit('receive-group-message', message);
      });

      socket.on('mark-read', async ({ chatId }) => {
        if (!chatId) return;

        const [userA, userB] = chatId.split('-');
        const senderId = userId === userA ? userB : userA;

        await Message.updateMany(
          { senderId, receiverId: userId, status: { $ne: 'read' } },
          { status: 'read', read: true }
        );

        socket.emit('messages-marked-read', { senderId });
      });

      socket.on('mark-group-read', async ({ groupId }) => {
        if (!groupId) return;

        // Add userId to readBy array for all unread messages in the group
        await Message.updateMany(
          {
            receiverType: 'group',
            receiverId: groupId,
            readBy: { $ne: userId }
          },
          { $addToSet: { readBy: userId } }
        );

        socket.emit('group-messages-marked-read', { groupId });
      });

      socket.on('disconnect', async () => {
        onlineUsers.delete(socket.userId);
        console.log('User disconnected:', socket.userId);

        // Update lastSeen in database
        const lastSeen = new Date();
        await User.findByIdAndUpdate(socket.userId, { lastSeen });

        // Emit user-offline to all clients
        io.emit('user-offline', { userId: socket.userId, lastSeen });
      });
    } catch (err) {
      console.error('Socket auth failed:', err.message);
      socket.disconnect();
    }
  });
};

module.exports = { initializeSocket, onlineUsers };
