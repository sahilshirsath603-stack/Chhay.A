const express = require('express');
const router = express.Router();

const { upload } = require('../config/cloudinaryConfig');
const controllers = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// ⛔ STOP HERE IF ANY ARE UNDEFINED
router.post('/signup', upload.single('profileImage'), controllers.signup);
router.post('/login', controllers.login);
router.get('/check-username', controllers.checkUsername);
router.get('/users', authMiddleware, controllers.getUsers);
router.get('/presence', controllers.getPresence);
router.get('/users/status', controllers.getUsersStatus);
router.get('/users/me', authMiddleware, controllers.getMe);

// TEMPORARY GLOBAL DB SEED ROUTE
router.get('/seed-global', async (req, res) => {
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  
  const profiles = [
    { name: "Priya Sharma", username: "priya_s", about: "Coffee lover and travel enthusiast ☕✈️", imgNum: 44, auraColor: "#FF6B6B" },
    { name: "Ananya Patel", username: "ananya_p", about: "Digital creator and foodie 🍕📱", imgNum: 45, auraColor: "#4ECDC4" },
    { name: "Riya Singh", username: "riya_vibes", about: "Music is my escape 🎧", imgNum: 46, auraColor: "#FFD166" },
    { name: "Kavya Gupta", username: "kavya_g", about: "Software Engineer & Reader 📚💻", imgNum: 47, auraColor: "#6B5B95" },
    { name: "Neha Reddy", username: "neha.r", about: "Living life one adventure at a time 🌍", imgNum: 48, auraColor: "#FF9F1C" },
    { name: "Diya Desai", username: "diya_d", about: "Art, Yoga, and Peace 🧘‍♀️🎨", imgNum: 49, auraColor: "#2AB7CA" },
    { name: "Aditi Joshi", username: "aditi.j", about: "Aspiring photographer 📸", imgNum: 50, auraColor: "#F37736" },
    { name: "Sneha Kumar", username: "sneha_k", about: "Dog mom & nature lover 🐕🌲", imgNum: 51, auraColor: "#85E21F" },
    { name: "Meera Nair", username: "meera_n", about: "Fashion & Lifestyle ✨", imgNum: 52, auraColor: "#FE4A90" },
    { name: "Pooja Verma", username: "pooja_v", about: "Always looking for the next sunset 🌅", imgNum: 53, auraColor: "#9D4EDD" }
  ];

  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    let count = 0;
    
    for (const profile of profiles) {
      const email = `${profile.username}@example.com`;
      const existing = await User.findOne({ email });
      if (existing) continue;

      await User.create({
        name: profile.name,
        username: profile.username,
        email: email,
        passwordHash: passwordHash,
        about: profile.about,
        avatar: `https://randomuser.me/api/portraits/women/${profile.imgNum}.jpg`,
        aura: {
          type: "focus",
          label: "Chill",
          color: profile.auraColor,
          icon: "✨",
        }
      });
      count++;
    }
    
    res.json({ message: `Successfully seeded global database with ${count} new generic profiles!` });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
router.get('/users/room-archives', authMiddleware, controllers.getRoomArchives);
router.put('/users/profile', authMiddleware, controllers.updateProfile);
router.post('/users/avatar', authMiddleware, upload.single('avatar'), controllers.uploadAvatar);
router.delete('/users/delete-account', authMiddleware, controllers.deleteAccount);

module.exports = router;
