import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  socket = io(process.env.REACT_APP_SOCKET_URL || 'https://chhay-achaaya-backend.onrender.com', {
    auth: { token }
  });
  return socket;
};

export const getSocket = () => socket;

export const toggleReaction = ({ chatId, groupId, messageId, emoji }) => {
  if (socket) {
    socket.emit('toggle-reaction', { chatId, groupId, messageId, emoji });
  }
};
