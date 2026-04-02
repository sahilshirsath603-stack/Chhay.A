const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config({ path: '.env.local' });
const User = require('./models/User');

const run = async () => {
  await connectDB();
  const users = await User.find({ avatar: { $ne: null } });
  
  for (const user of users) {
    if (user.avatar && !path.extname(user.avatar) && user.avatar.includes('/uploads/')) {
      const oldAvatarUrl = user.avatar;
      const newAvatarUrl = `${oldAvatarUrl}.jpg`;
      
      const filename = path.basename(oldAvatarUrl);
      const oldFilePath = path.join(__dirname, 'uploads', filename);
      const newFilePath = `${oldFilePath}.jpg`;
      
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.renameSync(oldFilePath, newFilePath);
          console.log(`Renamed file ${filename} to ${filename}.jpg`);
        }
        user.avatar = newAvatarUrl;
        await user.save();
        console.log(`Updated user ${user.email} avatar in DB.`);
      } catch (e) {
        console.error(`Failed to process ${user.email}`, e);
      }
    }
  }
  
  console.log("Avatar fix completed.");
  process.exit(0);
};

run().catch(console.error);
