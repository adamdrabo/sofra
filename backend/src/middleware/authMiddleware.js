const jwt = require('jsonwebtoken');

// Publier une recette exige toujours une session (voir le cas
// d'utilisation "Publier include S'authentifier").
function exigerSession(req, res, next) {
  const enTete = req.headers.authorization;
  if (!enTete || !enTete.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Session requise' });
  }
  const jeton = enTete.split(' ')[1];
  try {
    const payload = jwt.verify(jeton, process.env.JWT_SECRET);
    req.compteId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ erreur: 'Session invalide ou expiree' });
  }
}

module.exports = { exigerSession };
