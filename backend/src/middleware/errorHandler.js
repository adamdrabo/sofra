function errorHandler(err, req, res, next) {
  console.error(err);
  const statut = err.statut || 500;
  res.status(statut).json({ erreur: err.message || 'Erreur serveur' });
}

module.exports = errorHandler;
