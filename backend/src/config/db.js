const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connecte');
  } catch (err) {
    console.error('Erreur de connexion a MongoDB :', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
