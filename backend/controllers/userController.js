const User = require('../models/User');

// Search users by username
const searchUsers = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ message: 'Username query parameter is required' });
        }

        // Search users where username matches query (case-insensitive partial match)
        // Exclude the current user from the results
        const users = await User.find({
            username: { $regex: username, $options: 'i' }
        })
            .select('username avatar about defaultMood connections')
            .limit(20);

        res.json(users);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Failed to search users', error: error.message, stack: error.stack });
    }
};

module.exports = {
    searchUsers
};
