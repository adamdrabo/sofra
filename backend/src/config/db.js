const mongoose = require('mongoose');

async function connecterBase(uri) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[db] Connecte a MongoDB (${mongoose.connection.name})`);
  } catch (err) {
    console.error('[db] Connexion MongoDB impossible :', err.message);
    console.error("[db] Verifier MONGODB_URI, que Mongo tourne, et la liste d'IP autorisees sur Atlas.");
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => console.warn('[db] Connexion MongoDB perdue'));
  mongoose.connection.on('reconnected', () => console.log('[db] Connexion MongoDB retablie'));
}

module.exports = { connecterBase }
