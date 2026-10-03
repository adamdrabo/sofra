const TermeExclu = require('../models/TermeExclu');
const { ErreurApi } = require('../middleware/errorHandler');

async function obtenirTermesActifs() {
  const docs = await TermeExclu.find({ estActif: true }).select('terme -_id').lean();
  const termes = docs.map((d) => d.terme);
  if (termes.length === 0) {
    throw new ErreurApi(
      503,
      'FILTRE_INDISPONIBLE',
      'Le filtre d\'exclusion est vide. Lancer "npm run seed" sur le serveur.'
    );
  }
  return termes;
}

function construireExcludeIngredients(termes) {
  return termes.join(',');
}

function echapper(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termesPresents(texte, termes) {
  if (!texte) return [];
  const bas = texte.toLowerCase();
  return termes.filter((t) => new RegExp(`\\b${echapper(t)}s?\\b`, 'i').test(bas));
}

module.exports = { obtenirTermesActifs, construireExcludeIngredients, termesPresents };
