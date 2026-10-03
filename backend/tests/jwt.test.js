/**
 * Tests unitaires des jetons de session.
 *
 * POURQUOI
 * Le jeton est ce qui autorise une publication. Trois choses doivent
 * etre vraies : il contient bien l'identifiant du compte, il n'est pas
 * accepte avec un autre secret, et il expire.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

// Le secret est lu dans l'environnement au moment de l'appel : on le
// pose ici, avant d'importer le module.
process.env.JWT_SECRET = 'secret-de-test-assez-long-pour-etre-realiste';
process.env.JWT_EXPIRATION = '7d';

const { signerJeton, verifierJeton } = require('../src/utils/jwt');

test('un jeton signe puis verifie redonne l identifiant du compte', () => {
  const jeton = signerJeton('6ab36666d4b3e02e10f097ba');
  assert.equal(verifierJeton(jeton).sub, '6ab36666d4b3e02e10f097ba');
});

test('un jeton a trois parties separees par des points', () => {
  assert.equal(signerJeton('abc').split('.').length, 3);
});

// Un JWT est signe, pas chiffre : la charge est lisible. C'est
// precisement pour ca qu'on n'y met ni courriel ni nom.
test('le jeton ne contient que l identifiant, aucune donnee personnelle', () => {
  const charge = verifierJeton(signerJeton('abc'));
  assert.deepEqual(Object.keys(charge).sort(), ['exp', 'iat', 'sub']);
});

test('un jeton signe avec un autre secret est refuse', () => {
  const jeton = signerJeton('abc');
  process.env.JWT_SECRET = 'un-autre-secret';
  assert.throws(() => verifierJeton(jeton), { name: 'JsonWebTokenError' });
  process.env.JWT_SECRET = 'secret-de-test-assez-long-pour-etre-realiste';
});

test('un jeton modifie est refuse', () => {
  const jeton = signerJeton('abc');
  const falsifie = jeton.slice(0, -2) + 'xx';
  assert.throws(() => verifierJeton(falsifie));
});

test('un jeton expire est refuse', () => {
  process.env.JWT_EXPIRATION = '1ms';
  const jeton = signerJeton('abc');
  process.env.JWT_EXPIRATION = '7d';
  // On attend le temps qu'il faut pour que l'expiration soit depassee.
  const fin = Date.now() + 1100;
  while (Date.now() < fin) {
    // attente active, volontairement simple pour un test
  }
  assert.throws(() => verifierJeton(jeton), { name: 'TokenExpiredError' });
});
