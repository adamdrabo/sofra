/**
 * Tests unitaires du filtre d'exclusion.
 *
 * POURQUOI CES TESTS EN PREMIER
 * termesPresents est la fonction qui porte la promesse du produit :
 * c'est elle qui relit les resultats de Spoonacular pour attraper ce que
 * le filtre de l'API a laisse passer. Une erreur ici ne se verrait pas a
 * l'ecran, elle laisserait simplement passer un plat non conforme.
 *
 * Ces tests ne touchent ni la base ni le reseau : ils appellent une
 * fonction et verifient ce qu'elle renvoie.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { termesPresents, construireExcludeIngredients } = require('../src/services/exclusionService');

const TERMES = ['ham', 'pork', 'wine', 'gin', 'rum'];

test('termesPresents trouve un terme present dans le texte', () => {
  assert.deepEqual(termesPresents('Honey Glazed Ham', TERMES), ['ham']);
});

test('termesPresents ignore la casse', () => {
  assert.deepEqual(termesPresents('HONEY GLAZED HAM', TERMES), ['ham']);
});

test('termesPresents accepte le pluriel simple', () => {
  assert.deepEqual(termesPresents('two hams on the table', TERMES), ['ham']);
});

// Le coeur du sujet : la recherche se fait par mot entier. Sans ca,
// "gin" retirerait toutes les recettes au gingembre.
test('termesPresents ne declenche pas sur un mot qui contient le terme', () => {
  assert.deepEqual(termesPresents('Graham crackers with ginger', TERMES), []);
});

test('termesPresents ne declenche pas sur shampoo pour le terme ham', () => {
  assert.deepEqual(termesPresents('shampoo bottle', TERMES), []);
});

test('termesPresents renvoie tous les termes trouves', () => {
  const trouves = termesPresents('red wine sauce with pork chops', TERMES);
  assert.deepEqual(trouves.sort(), ['pork', 'wine']);
});

test('termesPresents renvoie une liste vide sur un texte sans terme', () => {
  assert.deepEqual(termesPresents('Tajine de poulet aux olives', TERMES), []);
});

test('termesPresents accepte un texte vide ou absent', () => {
  assert.deepEqual(termesPresents('', TERMES), []);
  assert.deepEqual(termesPresents(null, TERMES), []);
  assert.deepEqual(termesPresents(undefined, TERMES), []);
});

// Un terme contenant une parenthese casserait l'expression reguliere
// s'il n'etait pas echappe. Le test verifie qu'on ne leve pas d'erreur.
test('termesPresents echappe les caracteres speciaux d un terme', () => {
  assert.doesNotThrow(() => termesPresents('vin rouge', ['vin (rouge)', 'rhum [brun]']));
});

test('construireExcludeIngredients assemble les termes pour l appel API', () => {
  assert.equal(construireExcludeIngredients(['pork', 'wine']), 'pork,wine');
});

test('construireExcludeIngredients sur un seul terme', () => {
  assert.equal(construireExcludeIngredients(['pork']), 'pork');
});
