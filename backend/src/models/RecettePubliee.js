const mongoose = require('mongoose');

// Une recette publiee est une copie figee : elle ne pointe pas vers
// la recette locale de l'auteur. Si l'auteur modifie la sienne, le fil ne change pas.
const ingredientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  quantite: { type: Number, required: true },
  unite: { type: String, required: true }
}, { _id: false });

const etapeSchema = new mongoose.Schema({
  ordre: { type: Number, required: true },
  texte: { type: String, required: true }
}, { _id: false });

const recettePublieeSchema = new mongoose.Schema({
  auteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Compte', required: true },
  titre: {
    fr: { type: String, required: true },
    en: { type: String },
    ar: { type: String }
  },
  categorie: { type: String, required: true },
  nombrePortions: { type: Number, required: true },
  tempsPreparation: { type: Number, required: true },
  ingredients: [ingredientSchema],
  etapes: [etapeSchema],
  datePublication: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecettePubliee', recettePublieeSchema);
