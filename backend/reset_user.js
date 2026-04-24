// Run with: node reset_user.js your@email.com
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node reset_user.js your@email.com');
  process.exit(1);
}

async function resetUser() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const User = require('./models/User');
  const result = await User.deleteOne({ email });

  if (result.deletedCount === 0) {
    console.log(`ℹ️  No user found with email: ${email}`);
  } else {
    console.log(`✅ Deleted user with email: ${email}`);
    console.log('   You can now register again with this email.');
  }

  await mongoose.disconnect();
}

resetUser().catch(console.error);
