const fs = require('fs');
fs.renameSync('backend/models/user.js', 'backend/models/user_temp.js');
fs.renameSync('backend/models/user_temp.js', 'backend/models/User.js');
console.log('Renamed successfully');
