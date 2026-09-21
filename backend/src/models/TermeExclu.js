const mongoose = require('mongoose');

// Liste des termes utilises pour construire excludeIngredients avant
// chaque appel a Spoonacular. Vit cote serveur pour pouvoir etre
// corrigee sans republier l'application.
const termeExcluSchema = new mongoose.Schema({
  terme: { type: String, required: true },
  langue: { type: String, enum: ['fr', 'en'], default: 'fr' },
  raison: { type: String },
  estActif: { type: Boolean, default: true }
});

module.exports = mongoose.model('TermeExclu', termeExcluSchema);
