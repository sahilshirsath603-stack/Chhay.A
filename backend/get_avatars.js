const connectDB = require('./config/db');
require('dotenv').config({ path: '.env.local' });
const User = require('./models/User');

const run = async () => {
    await connectDB();
    const users = await User.find({}, 'name email avatar');
    users.forEach(u => console.log(`User: ${u.name || u.email}, Avatar: ${u.avatar}`));
    process.exit(0);
};

run().catch(console.error);
