const mongoose = require('mongoose');

const compteSchema = new mongoose.Schema(
  {
    courriel: {
      type: String,
      required: [true, 'Le courriel est obligatoire.'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Courriel trop long.'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Courriel invalide.'],
    },
    motDePasseHash: { type: String, required: true, select: false },
    nomAffiche: {
      type: String,
      required: [true, 'Le nom affiche est obligatoire.'],
      trim: true,
      minlength: [2, 'Nom affiche trop court.'],
      maxlength: [40, 'Nom affiche trop long.'],
    },
    langue: { type: String, enum: ['fr', 'en', 'ar'], default: 'fr' },
    dateInscription: { type: Date, default: Date.now },
  },
  {
    collection: 'compte',
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        delete ret.motDePasseHash;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Compte', compteSchema);
