const bcrypt = require('bcryptjs');
const Compte = require('../models/Compte');
const { genererJeton } = require('../utils/jwt');

async function inscription(req, res, next) {
  try {
    const { courriel, motDePasse, nomAffiche, langue } = req.body;
    if (!courriel || !motDePasse || !nomAffiche) {
      return res.status(400).json({ erreur: 'courriel, motDePasse et nomAffiche sont requis' });
    }
    const existe = await Compte.findOne({ courriel });
    if (existe) {
      return res.status(409).json({ erreur: 'Un compte existe deja avec ce courriel' });
    }
    const motDePasseHash = await bcrypt.hash(motDePasse, 10);
    const compte = await Compte.create({ courriel, motDePasseHash, nomAffiche, langue });
    const jeton = genererJeton(compte);
    res.status(201).json({ jeton, compte: { id: compte._id, nomAffiche: compte.nomAffiche } });
  } catch (err) {
    next(err);
  }
}

async function connexion(req, res, next) {
  try {
    const { courriel, motDePasse } = req.body;
    const compte = await Compte.findOne({ courriel });
    if (!compte) {
      return res.status(401).json({ erreur: 'Identifiants invalides' });
    }
    const motDePasseValide = await bcrypt.compare(motDePasse, compte.motDePasseHash);
    if (!motDePasseValide) {
      return res.status(401).json({ erreur: 'Identifiants invalides' });
    }
    const jeton = genererJeton(compte);
    res.json({ jeton, compte: { id: compte._id, nomAffiche: compte.nomAffiche } });
  } catch (err) {
    next(err);
  }
}

module.exports = { inscription, connexion };
