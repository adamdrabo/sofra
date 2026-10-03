/**
 * Tests unitaires de la traduction d'une carte en parametres d'appel.
 *
 * POURQUOI
 * C'est la seule chose qui distingue les trois cartes du produit. Si
 * cette table se vide ou change de nom de parametre, les trois cartes
 * renvoient le meme plan et personne ne s'en apercoit tout de suite.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SPOONACULAR_KEY = 'cle-de-test';

const { PARAMETRES_PAR_CARTE } = require('../src/services/spoonacularService');

test('les trois cartes du produit existent, et seulement elles', () => {
  assert.deepEqual(Object.keys(PARAMETRES_PAR_CARTE).sort(), ['EQUILIBRE', 'PROTEINES', 'RAPIDE']);
});

test('Equilibre n ajoute aucun filtre', () => {
  assert.deepEqual(PARAMETRES_PAR_CARTE.EQUILIBRE, {});
});

test('Rapide a cuisiner limite le temps de preparation', () => {
  assert.ok(PARAMETRES_PAR_CARTE.RAPIDE.maxReadyTime > 0);
});

test('Riche en proteines impose un minimum de proteines', () => {
  assert.ok(PARAMETRES_PAR_CARTE.PROTEINES.minProtein > 0);
});

test('les trois cartes donnent trois appels differents', () => {
  const signatures = Object.values(PARAMETRES_PAR_CARTE).map((p) => JSON.stringify(p));
  assert.equal(new Set(signatures).size, 3);
});
