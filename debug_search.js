const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function test() {
    try {
        // Assuming connectDB config or direct connection
        await mongoose.connect('mongodb://localhost:27017/chaaya_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to DB');

        const username = 'ras';

        // Dummy user ID
        const dummyId = new mongoose.Types.ObjectId();

        const users = await User.find({
            username: { $regex: username, $options: 'i' },
            _id: { $ne: dummyId }
        })
            .select('username avatar about defaultMood connections')
            .limit(20);

        console.log('Results:', users.length);
        console.log(users);
    } catch (err) {
        console.error('Mongoose Query Error:', err);
    } finally {
        mongoose.connection.close();
    }
}

test();
