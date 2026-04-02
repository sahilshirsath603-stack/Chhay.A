const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (!ext || ext === '.') {
      ext = `.${file.mimetype.split('/')[1]}`;
      if (ext === '.jpeg') ext = '.jpg';
    }
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  (req, res) => {
    res.json({
      url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`,
      type: req.file.mimetype
    });
  }
);

module.exports = router;
