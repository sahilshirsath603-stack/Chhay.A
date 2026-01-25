const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SIGNUP
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      passwordHash: hashedPassword
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    console.log('LOGIN BODY:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'yes' : 'no');
    console.log('Password hash:', user ? user.passwordHash : 'undefined');
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

// GET USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id email name about avatar lastSeen');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// GET USERS STATUS
const getUsersStatus = async (req, res) => {
  try {
    const users = await User.find({}, '_id email name about avatar lastSeen');
    // Online status determined ONLY from active Socket.IO connections
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users status' });
  }
};

// GET PRESENCE
const getPresence = async (req, res) => {
  try {
    // Get all users from DB
    const dbUsers = await User.find({}, '_id lastSeen');

    // Get online users from global set (imported from socket.js)
    const { onlineUsers } = require('../sockets/socket');

    // Merge online status
    const presence = dbUsers.map(user => ({
      _id: user._id,
      online: onlineUsers.has(user._id.toString()),
      lastSeen: user.lastSeen
    }));

    res.json(presence);
  } catch (err) {
    console.error('Presence error:', err);
    res.status(500).json({ message: 'Failed to fetch presence' });
  }
};

// GET ME
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email about avatar lastSeen');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (about !== undefined) updateData.about = about;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = {
  signup,
  login,
  getUsers,
  getUsersStatus,
  getPresence,
  getMe,
  updateProfile
};
