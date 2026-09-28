const mongoose = require('mongoose');

const termeExcluSchema = new mongoose.Schema(
  {
    terme: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 60 },
    langue: { type: String, enum: ['fr', 'en'], default: 'en' },
    raison: { type: String, trim: true, maxlength: 200 },
    estActif: { type: Boolean, default: true, index: true },
  },
  { collection: 'termeExclu', versionKey: false }
);

module.exports = mongoose.model('TermeExclu', termeExcluSchema);
