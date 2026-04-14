const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup unified storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'whatsapp_clone', // Folder in cloudinary
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'pdf', 'zip', 'mp3', 'wav', 'mpeg', 'webm'],
    // We can allow resource_type 'auto' to support images, videos, and raw files
    resource_type: 'auto'
  }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
