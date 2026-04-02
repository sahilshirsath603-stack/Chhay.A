const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinaryConfig');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  (req, res) => {
    res.json({
      url: req.file.path,
      type: req.file.mimetype
    });
  }
);

module.exports = router;
