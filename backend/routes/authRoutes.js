const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const controllers = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ⛔ STOP HERE IF ANY ARE UNDEFINED
router.post('/signup', upload.single('profileImage'), controllers.signup);
router.post('/login', controllers.login);
router.get('/check-username', controllers.checkUsername);
router.get('/users', authMiddleware, controllers.getUsers);
router.get('/presence', controllers.getPresence);
router.get('/users/status', controllers.getUsersStatus);
router.get('/users/me', authMiddleware, controllers.getMe);
router.get('/users/room-archives', authMiddleware, controllers.getRoomArchives);
router.put('/users/profile', authMiddleware, controllers.updateProfile);
router.post('/users/avatar', authMiddleware, upload.single('avatar'), controllers.uploadAvatar);
router.delete('/users/delete-account', authMiddleware, controllers.deleteAccount);

module.exports = router;
