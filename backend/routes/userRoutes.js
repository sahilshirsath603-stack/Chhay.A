const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/users', authMiddleware, authController.getUsers);
router.get('/me', authMiddleware, authController.getMe);
router.get('/search', userController.searchUsers);
router.get('/:id', authMiddleware, authController.getUserById);

module.exports = router;
