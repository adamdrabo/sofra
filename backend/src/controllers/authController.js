
const bcrypt = require('bcryptjs');
const Compte = require('../models/Compte');
const { signerJeton } = require('../utils/jwt');
const { ErreurApi } = require('../middleware/errorHandler');

const COUT_HACHAGE = 10;

function validerMotDePasse(motDePasse) {
  if (typeof motDePasse !== 'string' || motDePasse.length < 8) {
    throw new ErreurApi(400, 'MOT_DE_PASSE_TROP_COURT', 'Le mot de passe doit contenir au moins 8 caracteres.');
  }
  if (Buffer.byteLength(motDePasse, 'utf8') > 72) {
    throw new ErreurApi(400, 'MOT_DE_PASSE_TROP_LONG', 'Le mot de passe est trop long.');
  }
}

async function inscription(req, res) {
  const { courriel, motDePasse, nomAffiche, langue } = req.body ?? {};
  validerMotDePasse(motDePasse);

  const motDePasseHash = await bcrypt.hash(motDePasse, COUT_HACHAGE);
  const compte = await Compte.create({ courriel, motDePasseHash, nomAffiche, langue });

  res.status(201).json({ jeton: signerJeton(compte._id), compte });
}

async function connexion(req, res) {
  const { courriel, motDePasse } = req.body ?? {};
  if (typeof courriel !== 'string' || typeof motDePasse !== 'string') {
    throw new ErreurApi(400, 'DONNEES_INVALIDES', 'Courriel et mot de passe obligatoires.');
  }

  const compte = await Compte.findOne({ courriel: courriel.trim().toLowerCase() }).select('+motDePasseHash');
  const valide = compte ? await bcrypt.compare(motDePasse, compte.motDePasseHash) : false;
  if (!valide) {
    throw new ErreurApi(401, 'IDENTIFIANTS_INVALIDES', 'Courriel ou mot de passe invalide.');
  }

  res.json({ jeton: signerJeton(compte._id), compte });
}

async function moi(req, res) {
  res.json({ compte: req.compte });
}

module.exports = { inscription, connexion, moi };
