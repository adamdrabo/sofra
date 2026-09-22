/**
 * POURQUOI CE FICHIER
 * Toutes les erreurs du serveur passent ici et ressortent sous UNE seule forme :
 *   { "erreur": { "code": "COURRIEL_DEJA_UTILISE", "message": "..." } }
 * Le client mobile (composant "Client Sofra", C4 niveau 3) n'a donc qu'un format a lire,
 * et il peut traduire le "code" dans la langue de l'utilisateur (fr, en, ar)
 * au lieu d'afficher notre message francais tel quel.
 *
 * CONTEXTE
 * - ErreurApi sert aux erreurs prevues (400, 401, 404, 409, 503...).
 * - Express 5 transmet automatiquement ici les erreurs lancees dans une fonction async :
 *   pas besoin de try/catch ni d'express-async-handler dans les controleurs.
 * - Une erreur imprevue donne 500 avec un message generique : on ne renvoie jamais
 *   la pile d'appels au client (elle revele la structure interne du serveur).
 */

class ErreurApi extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Route inconnue : sans ce middleware, Express renverrait une page HTML, illisible pour l'app.
function routeIntrouvable(req, res, next) {
  next(new ErreurApi(404, 'ROUTE_INTROUVABLE', `Aucune route ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function gestionnaireErreurs(err, req, res, next) {
  let erreur = err;

  // Traduction des erreurs de bibliotheques en erreurs Sofra.
  if (err.type === 'entity.parse.failed') {
    erreur = new ErreurApi(400, 'JSON_INVALIDE', 'Le corps de la requete n\'est pas du JSON valide.');
  } else if (err.type === 'entity.too.large') {
    erreur = new ErreurApi(413, 'CORPS_TROP_GROS', 'La requete depasse la taille permise.');
  } else if (err.name === 'ValidationError') {
    // Validation Mongoose : on renvoie le premier message, suffisant pour un formulaire.
    const premier = Object.values(err.errors)[0];
    erreur = new ErreurApi(400, 'DONNEES_INVALIDES', premier ? premier.message : 'Donnees invalides.');
  } else if (err.name === 'CastError') {
    // Ex. /api/fil/pas-un-objectid
    erreur = new ErreurApi(400, 'IDENTIFIANT_INVALIDE', 'Identifiant invalide.');
  } else if (err.code === 11000) {
    // Index unique viole. Seul cas possible pour l'instant : le courriel du compte.
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
