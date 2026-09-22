
const Compte = require('../models/Compte')
const { verifierJeton } = require('../utils/jwt')
const { ErreurApi } = require('./errorHandler')

async function exigerSession(req, res, next) {
  const entete = req.headers.authorization || ''
  const [type, jeton] = entete.split(' ')

  if (type !== 'Bearer' || !jeton) {
    throw new ErreurApi(401, 'JETON_ABSENT', 'Connexion requise.')
  }

  const charge = verifierJeton(jeton)
  const compte = await Compte.findById(charge.sub);
  if (!compte) {
    throw new ErreurApi(401, 'COMPTE_INTROUVABLE', 'Ce compte n\'existe plus.')
  }

  req.compte = compte
  next()
}

module.exports = { exigerSession }
