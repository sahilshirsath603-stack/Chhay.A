require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// If deploying to Render/Live, you can pass MONGO_URI inline
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsapp_clone_db';

// Simple direct Mongoose Model mimicking the actual User schema
const User = mongoose.model('User', new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true },
    passwordHash: String,
    about: { type: String, default: '', maxlength: 120 },
    avatar: { type: String, default: null },
    lastSeen: { type: Date, default: null },
    showOnlineStatus: { type: Boolean, default: true },
    defaultMood: { type: String, default: null },
    interests: [{ type: String }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    aura: {
      type: {
        type: String,
        default: null
      },
      label: { type: String, default: null },
      color: { type: String, default: null },
      icon: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      visibility: { type: String, enum: ["public", "friends", "private"], default: "public" },
    }
  },
  { timestamps: true }
));

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

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB... (${MONGO_URI})`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    const passwordHash = await bcrypt.hash('password123', 10);
    
    console.log('Seeding 10 accounts...');
    let count = 0;

    for (const profile of profiles) {
      const email = `${profile.username}@example.com`;
      
      // Check if user already exists
      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`User ${profile.username} already exists. Skipping.`);
        continue;
      }

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

    console.log(`✅ Seeding complete. Inserted ${count} new profiles.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
