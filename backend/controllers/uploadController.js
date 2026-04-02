const { upload } = require('../config/cloudinaryConfig');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Cloudinary stores the remote URL in req.file.path
    const fileUrl = req.file.path;
    const fileName = req.file.originalname || 'upload';
    const fileSize = req.file.size || 0;

    res.json({
      url: fileUrl,
      fileName: fileName,
      fileSize: fileSize
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};

module.exports = { upload, uploadFile };
