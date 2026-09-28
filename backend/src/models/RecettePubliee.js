const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Chaque ingredient doit avoir un nom.'], trim: true, maxlength: 100 },
    quantite: { type: Number, min: [0, 'Quantite negative.'], max: 100000 },
    unite: { type: String, trim: true, maxlength: 20, default: '' },
  },
  { _id: false }
);

const etapeSchema = new mongoose.Schema(
  {
    ordre: { type: Number, required: true, min: 1 },
    texte: { type: String, required: [true, 'Chaque etape doit avoir un texte.'], trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const titreSchema = new mongoose.Schema(
  {
    fr: { type: String, trim: true, maxlength: 120 },
    en: { type: String, trim: true, maxlength: 120 },
    ar: { type: String, trim: true, maxlength: 120 },
  },
  { _id: false }
);

const recettePublieeSchema = new mongoose.Schema(
  {
    auteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Compte', required: true, index: true },
    titre: {
      type: titreSchema,
      required: [true, 'Un titre est obligatoire.'],
      validate: {
        validator: (t) => Boolean(t && (t.fr || t.en || t.ar)),
        message: 'Un titre est obligatoire dans au moins une langue.',
      },
    },
    categorie: { type: String, trim: true, maxlength: 40 },
    nombrePortions: { type: Number, required: [true, 'Nombre de portions obligatoire.'], min: 1, max: 50 },
    tempsPreparation: { type: Number, min: 0, max: 1440 }, // minutes, 24 h maximum
    ingredients: {
      type: [ingredientSchema],
      validate: [
        { validator: (v) => v.length >= 1, message: 'Au moins un ingredient.' },
        { validator: (v) => v.length <= 100, message: 'Maximum 100 ingredients.' },
      ],
    },
    etapes: {
      type: [etapeSchema],
      validate: [
        { validator: (v) => v.length >= 1, message: 'Au moins une etape.' },
        { validator: (v) => v.length <= 50, message: 'Maximum 50 etapes.' },
      ],
    },
    datePublication: { type: Date, default: Date.now, index: -1 },
  },
  { collection: 'recettePubliee', versionKey: false }
);

module.exports = mongoose.model('RecettePubliee', recettePublieeSchema);
