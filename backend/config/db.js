const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = 'mongodb://127.0.0.1:27017/whatsapp_clone_db';
  console.log('FINAL MONGO_URI USED:', mongoURI);

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
