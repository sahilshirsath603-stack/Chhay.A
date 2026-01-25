const express = require('express');
const router = express.Router();

const controllers = require('../controllers/authController');

console.log('DEBUG authController exports:', controllers);
console.log('DEBUG signup type:', typeof controllers.signup);
console.log('DEBUG login type:', typeof controllers.login);
console.log('DEBUG getUsers type:', typeof controllers.getUsers);
console.log('DEBUG getUsersStatus type:', typeof controllers.getUsersStatus);

// ⛔ STOP HERE IF ANY ARE UNDEFINED
router.post('/signup', controllers.signup);
router.post('/login', controllers.login);
router.get('/users', controllers.getUsers);
router.get('/presence', controllers.getPresence);
router.get('/users/status', controllers.getUsersStatus);

module.exports = router;
