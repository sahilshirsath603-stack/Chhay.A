const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ConnectionRequest = require('../models/ConnectionRequest');

// CHECK USERNAME
const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'Username query parameter required' });

    // allow letters, numbers, underscores. min 3, max 20
    const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
    if (!isValid) return res.status(400).json({ message: 'Invalid username format' });

    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUser) {
      return res.json({ available: false });
    }

    return res.json({ available: true });
  } catch (err) {
    console.error('Check username error:', err);
    res.status(500).json({ message: 'Failed to check username' });
  }
};

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, username, email, password, bio, defaultMood, interests } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({ message: 'Name, username, email, and password required' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const usernameExists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse interests, if it comes as a JSON string from FormData
    let parsedInterests = [];
    if (interests) {
      try {
        parsedInterests = typeof interests === 'string' ? JSON.parse(interests) : interests;
      } catch (e) {
        parsedInterests = interests.split(',').map(i => i.trim());
      }
    }

    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    const newUser = await User.create({
      name,
      username,
      email,
      passwordHash: hashedPassword,
      about: bio || '',
      defaultMood: defaultMood || null,
      interests: parsedInterests,
      avatar: avatarUrl
    });

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
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
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId).select('connections');
    
    // Fetch pending requests sent by current user
    const sentRequests = await ConnectionRequest.find({
      sender: currentUserId,
      status: 'pending'
    }).select('receiver');
    const sentRequestReceiverIds = sentRequests.map(req => req.receiver.toString());
    const connectionIds = currentUser.connections.map(id => id.toString());

    // Fetch all users
    const users = await User.find({}, '_id email name about avatar lastSeen showOnlineStatus aura username');
    const maskedUsers = users.map(u => {
      const userObj = u.toObject ? u.toObject() : u;
      if (userObj.showOnlineStatus === false) {
        userObj.lastSeen = null;
      }
      delete userObj.showOnlineStatus; // Only send privacy pref to the owner
      
      // Determine connection state
      userObj.isConnected = connectionIds.includes(userObj._id.toString());
      userObj.isPendingRequest = sentRequestReceiverIds.includes(userObj._id.toString());
      
      return userObj;
    });
    res.json(maskedUsers);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// GET USERS STATUS
const getUsersStatus = async (req, res) => {
  try {
    const users = await User.find({}, '_id email name about avatar lastSeen showOnlineStatus');
    const maskedUsers = users.map(u => {
      const userObj = u.toObject ? u.toObject() : u;
      if (userObj.showOnlineStatus === false) {
        userObj.lastSeen = null;
      }
      delete userObj.showOnlineStatus;
      return userObj;
    });
    // Online status determined ONLY from active Socket.IO connections
    res.json(maskedUsers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users status' });
  }
};

// GET PRESENCE
const getPresence = async (req, res) => {
  try {
    // Get all users from DB
    const dbUsers = await User.find({}, '_id lastSeen showOnlineStatus');

    // Get online users from global set (imported from socket.js)
    const { onlineUsers } = require('../sockets/socket');

    // Merge online status
    const presence = dbUsers.map(user => {
      const isShow = user.showOnlineStatus !== false;
      return {
        _id: user._id,
        online: isShow ? onlineUsers.has(user._id.toString()) : false,
        lastSeen: isShow ? user.lastSeen : null
      };
    });

    res.json(presence);
  } catch (err) {
    console.error('Presence error:', err);
    res.status(500).json({ message: 'Failed to fetch presence' });
  }
};

// GET ME
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email username about avatar lastSeen connections aura showOnlineStatus');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

// GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email about avatar lastSeen connections aura username showOnlineStatus');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userObj = user.toObject({ getters: true });
    if (userObj.showOnlineStatus === false) {
      userObj.lastSeen = null;
    }
    delete userObj.showOnlineStatus;
    res.json(userObj);
  } catch (err) {
    console.error('Get user by id error:', err);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, about, avatar, username } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (about !== undefined) updateData.about = about;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (username !== undefined) {
      // Validate format
      const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
      if (!isValid) return res.status(400).json({ message: 'Invalid username format (3-20 chars, letters, numbers, underscores)' });

      // Check uniqueness
      const existingUser = await User.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') },
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updateData.username = username;
    }

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

// UPLOAD AVATAR
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

// GET ROOM ARCHIVES
const getRoomArchives = async (req, res) => {
  try {
    const RoomArchive = require('../models/RoomArchive');
    const archives = await RoomArchive.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(archives);
  } catch (err) {
    console.error('Fetch room archives error:', err);
    res.status(500).json({ message: 'Failed to fetch room archives' });
  }
};

// DELETE ACCOUNT (Full Cleanup)
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const Message = require('../models/Message');
    const ConnectionRequest = require('../models/ConnectionRequest');
    const Notification = require('../models/Notification');
    const Group = require('../models/Group');
    const MicroRoom = require('../models/MicroRoom');
    const RoomArchive = require('../models/RoomArchive');

    // 1. Delete user from User collection
    await User.findByIdAndDelete(userId);

    // 2. Remove user from other users' connections
    await User.updateMany(
      { connections: userId },
      { $pull: { connections: userId } }
    );

    // 3. Delete connection requests involving this user
    await ConnectionRequest.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // 4. Delete messages sent by user
    await Message.deleteMany({ senderId: userId });

    // 5. Remove user from groups (members and admins) and delete groups they created
    await Group.updateMany(
      { $or: [{ members: userId }, { admins: userId }] },
      { $pull: { members: userId, admins: userId } }
    );
    await Group.deleteMany({ createdBy: userId });

    // 6. Delete notifications involving this user
    await Notification.deleteMany({
      $or: [{ user: userId }, { from: userId }]
    });

    // 7. Remove user from participants and delete MicroRooms they created
    await MicroRoom.updateMany(
      { participants: userId },
      { $pull: { participants: userId } }
    );
    await MicroRoom.deleteMany({ createdBy: userId });

    // 8. Delete room archives created by the user
    await RoomArchive.deleteMany({ createdBy: userId });

    res.status(200).json({ message: 'Account permanently deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

module.exports = {
  checkUsername,
  signup,
  login,
  getUsers,
  getUsersStatus,
  getPresence,
  getMe,
  getUserById,
  updateProfile,
  uploadAvatar,
  getRoomArchives,
  deleteAccount
};
