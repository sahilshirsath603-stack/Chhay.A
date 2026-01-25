const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { createGroup, getGroups, getGroupById, addMember, removeMember, getGroupMedia, renameGroup } = require('../controllers/groupController');

// Get all groups for logged-in user
router.get('/', authMiddleware, getGroups);

// Get group by ID
router.get('/:groupId', authMiddleware, getGroupById);

// Create new group
router.post('/', authMiddleware, (req, res, next) => {
  console.log("GROUP ROUTE HIT", req.body, req.user?.id);
  next();
}, createGroup);

// Add member to group
router.post('/:groupId/members', authMiddleware, addMember);

// Remove member from group
router.delete('/:groupId/members/:userId', authMiddleware, removeMember);

// Get group media
router.get('/:groupId/media', authMiddleware, getGroupMedia);

// Rename group (admin only)
router.put('/:groupId/rename', authMiddleware, renameGroup);

module.exports = router;
