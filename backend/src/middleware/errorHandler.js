class ErreurApi extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function routeIntrouvable(req, res, next) {
  next(new ErreurApi(404, 'ROUTE_INTROUVABLE', `Aucune route ${req.method} ${req.originalUrl}`));
}

function gestionnaireErreurs(err, req, res, next) {
  let erreur = err;


  if (err.type === 'entity.parse.failed') {
    erreur = new ErreurApi(400, 'JSON_INVALIDE', 'Le corps de la requete n\'est pas du JSON valide.');
  } else if (err.type === 'entity.too.large') {
    erreur = new ErreurApi(413, 'CORPS_TROP_GROS', 'La requete depasse la taille permise.');
  } else if (err.name === 'ValidationError') {
    const premier = Object.values(err.errors)[0];
    erreur = new ErreurApi(400, 'DONNEES_INVALIDES', premier ? premier.message : 'Donnees invalides.');
  } else if (err.name === 'CastError') {
    erreur = new ErreurApi(400, 'IDENTIFIANT_INVALIDE', 'Identifiant invalide.');
  } else if (err.code === 11000) {
    erreur = new ErreurApi(409, 'COURRIEL_DEJA_UTILISE', 'Un compte existe deja avec ce courriel.');
  } else if (err.name === 'TokenExpiredError') {
    erreur = new ErreurApi(401, 'SESSION_EXPIREE', 'La session a expire, reconnecte-toi.');
  } else if (err.name === 'JsonWebTokenError') {
    erreur = new ErreurApi(401, 'JETON_INVALIDE', 'Jeton invalide.');
  }

  if (!(erreur instanceof ErreurApi)) {
    console.error('[erreur imprevue]', err);
    erreur = new ErreurApi(500, 'ERREUR_SERVEUR', 'Erreur interne du serveur.');
  }

  const corps = { erreur: { code: erreur.code, message: erreur.message } };
  if (erreur.details) corps.erreur.details = erreur.details;
  res.status(erreur.status).json(corps);
}

module.exports = { ErreurApi, routeIntrouvable, gestionnaireErreurs };
