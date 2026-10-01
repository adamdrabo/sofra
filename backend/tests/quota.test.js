/**
 * Tests unitaires du compteur de quota.
 *
 * POURQUOI
 * Le palier gratuit de Spoonacular donne un nombre de points limite par
 * jour. Ce service coupe avant la fin et renvoie un message clair,
 * plutot que de laisser l'application muette. Les tests verifient qu'il
 * coupe au bon moment, et surtout qu'il ne coupe pas trop tot.
 *
 * Les tests s'enchainent dans l'ordre parce que l'etat du service est
 * garde en memoire, exactement comme en production.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

process.env.QUOTA_SEUIL_MIN = '10';

const quota = require('../src/services/quotaService');

// Les en-tetes d'une reponse fetch exposent une methode get() : on
// imite seulement ce que le service utilise.
function entetes(valeurs) {
  return { get: (cle) => valeurs[cle] ?? null };
}

test('au demarrage, rien n est connu et aucun appel n est bloque', () => {
  const etat = quota.lireEtat();
  assert.equal(etat.utilise, null);
  assert.equal(etat.restant, null);
  assert.doesNotThrow(() => quota.verifierAvantAppel());
});

test('le service lit la consommation renvoyee par Spoonacular', () => {
  quota.mettreAJourDepuisEntetes(entetes({ 'x-api-quota-used': '18.5', 'x-api-quota-left': '31.5' }));
  const etat = quota.lireEtat();
  assert.equal(etat.utilise, 18.5);
  assert.equal(etat.restant, 31.5);
});

test('des en-tetes absents ou illisibles ne reinitialisent pas les compteurs', () => {
  quota.mettreAJourDepuisEntetes(entetes({}));
  assert.equal(quota.lireEtat().restant, 31.5);
});

test('au dessus du seuil, les appels passent', () => {
  quota.mettreAJourDepuisEntetes(entetes({ 'x-api-quota-left': '11' }));
  assert.doesNotThrow(() => quota.verifierAvantAppel());
});

test('sous le seuil, l appel est refuse avec un message pour la personne', () => {
  quota.mettreAJourDepuisEntetes(entetes({ 'x-api-quota-left': '9' }));
  assert.throws(() => quota.verifierAvantAppel(), (e) => {
    assert.equal(e.status, 503);
    assert.equal(e.code, 'QUOTA_EPUISE');
    assert.match(e.message, /demain/);
    return true;
  });
});

test('une reponse 402 de Spoonacular bloque les appels suivants', () => {
  quota.mettreAJourDepuisEntetes(entetes({ 'x-api-quota-left': '40' }));
  assert.doesNotThrow(() => quota.verifierAvantAppel());

  quota.marquerEpuise();
  assert.equal(quota.lireEtat().restant, 0);
  assert.throws(() => quota.verifierAvantAppel(), { code: 'QUOTA_EPUISE' });
});

test('l etat porte le jour UTC, qui sert a la remise a zero', () => {
  assert.equal(quota.lireEtat().jourUtc, new Date().toISOString().slice(0, 10));
});
