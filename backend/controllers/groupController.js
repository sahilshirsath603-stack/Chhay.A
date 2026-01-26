const mongoose = require('mongoose');
const Group = require('../models/Group');

const createGroup = async (req, res) => {
  try {
    const { name, members: memberIds } = req.body;

    // Extract creatorId from req.user._id
    const creatorId = new mongoose.Types.ObjectId(req.user._id);

    // Convert all incoming member IDs to mongoose.Types.ObjectId
    const members = memberIds.map(id => new mongoose.Types.ObjectId(id));

    // ALWAYS include creatorId in members
    members.push(creatorId);

    // Remove duplicates from members
    const uniqueMembers = [...new Set(members.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));

    const group = await Group.create({
      name,
      members: uniqueMembers,
      admins: [creatorId],
      createdBy: creatorId
    });

    // After save: Return the populated group (members, admins, createdBy)
    await group.populate('members', 'email');
    await group.populate('admins', 'email');
    await group.populate('createdBy', 'email');

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const groups = await Group.find({ members: { $in: [userObjectId] } })
      .populate('members', 'email')
      .populate('admins', 'email')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    const group = await Group.findById(groupId)
      .populate('members', 'name email')
      .populate('admins', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('getGroupById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupMedia = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // First check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch media messages for the group
    const Message = require('../models/Message');
    const mediaMessages = await Message.find({
      receiverType: 'group',
      receiverId: groupId,
      type: { $ne: 'text' }
    }).sort({ createdAt: -1 });

    res.json(mediaMessages);
  } catch (error) {
    console.error('Error fetching group media:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if requester is admin
    if (!Group.isAdmin(adminId, group)) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Check if user is already a member
    if (group.members.some(member => member.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add user to members
    group.members.push(new mongoose.Types.ObjectId(userId));
    await group.save();

    await group.populate('members', 'email');
    await group.populate('admins', 'email');
    await group.populate('createdBy', 'email');

    res.json(group);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const adminId = req.userId || req.user.id;

    console.log('REMOVE MEMBER', {
      requester: adminId,
      target: userId,
      group: groupId
    });

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if requester is admin
    if (!Group.isAdmin(adminId, group)) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Cannot remove the group creator
    if (group.createdBy.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove group creator' });
    }

    // Cannot remove yourself if you're the only admin
    if (adminId === userId && group.admins.length === 1) {
      return res.status(400).json({ message: 'Cannot remove yourself as the only admin' });
    }

    // Remove user from members and admins
    group.members = group.members.filter(member => member.toString() !== userId);
    group.admins = group.admins.filter(admin => admin.toString() !== userId);

    await group.save();

    await group.populate('members', 'email');
    await group.populate('admins', 'email');
    await group.populate('createdBy', 'email');

    res.json(group);
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Temporarily disabled unread logic
// const getUnreadCounts = async (req, res) => {
//   try {
//     const userId = req.userId || req.user.id;

//     // Get all groups the user is a member of
//     const groups = await Group.find({ members: new mongoose.Types.ObjectId(userId) });

//     const unreadCounts = {};

//     for (const group of groups) {
//       // Count messages in the group that are newer than the user's last read time
//       // For simplicity, assuming no lastRead tracking yet, return 0 or implement based on your logic
//       // You may need to add lastRead field to user or group membership
//       unreadCounts[group._id] = 0; // Placeholder, implement actual logic
//     }

//     res.json(unreadCounts);
//   } catch (error) {
//     console.error('Error fetching unread counts:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const renameGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name cannot be empty' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!Group.isAdmin(userId, group)) {
      return res.status(403).json({ message: 'Only admins can rename the group' });
    }

    // Update group name
    group.name = name.trim();
    await group.save();

    await group.populate('members', 'email');
    await group.populate('admins', 'email');
    await group.populate('createdBy', 'email');

    // Emit real-time update to all clients globally
    global.io.emit('group-renamed', {
      groupId,
      newName: name.trim()
    });

    res.json(group);
  } catch (error) {
    console.error('Error renaming group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!Group.isAdmin(userId, group)) {
      return res.status(403).json({ message: 'Only admins can update the group' });
    }

    // Update fields if provided
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Group name cannot be empty' });
      }
      group.name = name.trim();
    }

    // Handle avatar upload
    if (req.file) {
      group.avatar = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    await group.save();

    await group.populate('members', 'email');
    await group.populate('admins', 'email');
    await group.populate('createdBy', 'email');

    // Emit real-time update to all clients globally
    global.io.emit('group-updated', {
      groupId,
      group
    });

    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  getGroupMedia,
  addMember,
  removeMember,
  updateGroup,
  renameGroup
};
