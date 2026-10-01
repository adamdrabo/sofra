/**
 * Tests unitaires du gestionnaire d'erreurs.
 *
 * POURQUOI
 * Toutes les erreurs du serveur sortent par ce fichier, sous une seule
 * forme : { erreur: { code, message } }. L'application mobile n'a donc
 * qu'un cas a gerer. Si cette traduction se casse, elle se casse pour
 * toutes les routes a la fois.
 *
 * Aucun serveur n'est lance : on fabrique de fausses requetes et
 * reponses, et on appelle la fonction directement.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { ErreurApi, routeIntrouvable, gestionnaireErreurs } = require('../src/middleware/errorHandler');

// Fausse reponse Express : elle retient ce qu'on lui demande d'envoyer.
function fausseReponse() {
  return {
    statut: null,
    corps: null,
    status(code) {
      this.statut = code;
      return this;
    },
    json(corps) {
      this.corps = corps;
      return this;
    }
  };
}

function traiter(erreur) {
  const res = fausseReponse();
  gestionnaireErreurs(erreur, {}, res, () => {});
  return res;
}

test('une ErreurApi ressort avec son statut et son code', () => {
  const res = traiter(new ErreurApi(404, 'RECETTE_INTROUVABLE', 'Recette introuvable.'));
  assert.equal(res.statut, 404);
  assert.deepEqual(res.corps, { erreur: { code: 'RECETTE_INTROUVABLE', message: 'Recette introuvable.' } });
});

test('un index unique viole devient un 409 lisible', () => {
  const res = traiter(Object.assign(new Error('E11000'), { code: 11000 }));
  assert.equal(res.statut, 409);
  assert.equal(res.corps.erreur.code, 'COURRIEL_DEJA_UTILISE');
});

test('une erreur de validation Mongoose devient un 400 avec le premier message', () => {
  const erreur = Object.assign(new Error('echec'), {
    name: 'ValidationError',
    errors: { ingredients: { message: 'Au moins un ingredient.' } }
  });
  const res = traiter(erreur);
  assert.equal(res.statut, 400);
  assert.equal(res.corps.erreur.code, 'DONNEES_INVALIDES');
  assert.equal(res.corps.erreur.message, 'Au moins un ingredient.');
});

test('un identifiant mal forme devient un 400', () => {
  const res = traiter(Object.assign(new Error('cast'), { name: 'CastError' }));
  assert.equal(res.statut, 400);
  assert.equal(res.corps.erreur.code, 'IDENTIFIANT_INVALIDE');
});

test('un jeton expire devient un 401 qui invite a se reconnecter', () => {
  const res = traiter(Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' }));
  assert.equal(res.statut, 401);
  assert.equal(res.corps.erreur.code, 'SESSION_EXPIREE');
});

test('un jeton invalide devient un 401', () => {
  const res = traiter(Object.assign(new Error('jwt malformed'), { name: 'JsonWebTokenError' }));
  assert.equal(res.statut, 401);
  assert.equal(res.corps.erreur.code, 'JETON_INVALIDE');
});

test('un corps JSON invalide devient un 400', () => {
  const res = traiter(Object.assign(new Error('bad json'), { type: 'entity.parse.failed' }));
  assert.equal(res.statut, 400);
  assert.equal(res.corps.erreur.code, 'JSON_INVALIDE');
});

test('un corps trop gros devient un 413', () => {
  const res = traiter(Object.assign(new Error('too large'), { type: 'entity.too.large' }));
  assert.equal(res.statut, 413);
  assert.equal(res.corps.erreur.code, 'CORPS_TROP_GROS');
});

// Une erreur imprevue ne doit jamais reveler la structure interne du
// serveur a celui qui appelle.
test('une erreur imprevue devient un 500 generique, sans detail technique', () => {
  const silence = console.error;
  console.error = () => {};
  const res = traiter(new Error('TypeError: cannot read property x of undefined'));
  console.error = silence;

  assert.equal(res.statut, 500);
  assert.equal(res.corps.erreur.code, 'ERREUR_SERVEUR');
  assert.equal(res.corps.erreur.message, 'Erreur interne du serveur.');
  assert.equal(res.corps.erreur.details, undefined);
});

test('une route inexistante produit une erreur 404 nommant la methode et le chemin', () => {
  let recue = null;
  routeIntrouvable({ method: 'GET', originalUrl: '/api/inconnue' }, {}, (e) => {
    recue = e;
  });

  assert.equal(recue.status, 404);
  assert.equal(recue.code, 'ROUTE_INTROUVABLE');
  assert.match(recue.message, /GET \/api\/inconnue/);
});
