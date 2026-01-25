console.log('server.js file is executing');
console.log('Attempting MongoDB connection...');

require('dotenv').config({ path: '.env.local' });


const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const { initializeSocket } = require('./sockets/socket');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// TEMPORARILY comment DB to confirm server works
connectDB();
app.use('/api/groups', groupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

global.io = io;

initializeSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
