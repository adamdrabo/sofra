const mongoose = require('mongoose');

// Collection "compte" - un utilisateur qui peut publier des recettes
const compteSchema = new mongoose.Schema({
  courriel: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDePasseHash: { type: String, required: true },
  nomAffiche: { type: String, required: true },
  langue: { type: String, enum: ['fr', 'en', 'ar'], default: 'fr' },
  dateInscription: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Compte', compteSchema);
