require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const cleanDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to DB for cleaning...');

    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      await collection.deleteMany({});
      console.log(`Cleared collection: ${collection.collectionName}`);
    }

    console.log('Database clean complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning DB:', err.message);
    process.exit(1);
  }
};

cleanDB();
