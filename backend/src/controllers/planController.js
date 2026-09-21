const TermeExclu = require('../models/TermeExclu');
const { chercherRecettes } = require('../services/spoonacularService');
const { verifierEtIncrementer } = require('../services/quotaService');

// Point d'entree unique pour obtenir des recettes filtrees : le mobile
// n'appelle jamais Spoonacular directement (la cle ne peut pas vivre
// dans un bundle Expo).
async function obtenirRecettesFiltrees(req, res, next) {
  try {
    const { carte, langue = 'fr' } = req.body;
    if (!carte) {
      return res.status(400).json({ erreur: 'carte est requis' });
    }
    verifierEtIncrementer();

    const termes = await TermeExclu.find({ estActif: true, langue });
    const excludeIngredients = termes.map((t) => t.terme).join(',');

    const recettes = await chercherRecettes({ carte, excludeIngredients });
    res.json({ recettes });
  } catch (err) {
    next(err);
  }
}

module.exports = { obtenirRecettesFiltrees };
