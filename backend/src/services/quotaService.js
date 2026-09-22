/**
 * POURQUOI CE FICHIER
 * Composant "Compteur de quota" du C4 niveau 3 serveur. Spoonacular facture en points
 * par jour. Sur le palier gratuit, une fois les points epuises, l'API repond 402 et plus
 * aucun plan ne peut etre genere jusqu'a minuit UTC (20 h a Montreal en ete, 19 h en hiver).
 * Pendant une demo, ca veut dire une application muette. Ce service coupe AVANT la fin
 * du palier et renvoie une erreur claire que l'app peut afficher.
 *
 * CONTEXTE
 * - Spoonacular renvoie la consommation dans les en-tetes de chaque reponse :
 *   X-API-Quota-Used (total du jour) et X-API-Quota-Left (restant). On les lit au lieu
 *   de recompter nous-memes : c'est la seule source fiable.
 * - L'etat est en memoire. S'il redemarre, le serveur ne sait plus rien jusqu'au prochain
 *   appel, qui remet les compteurs a jour. Acceptable : aucun appel n'est bloque a tort,
 *   au pire un seul appel de plus passe.
 * - Le seuil vient de QUOTA_SEUIL_MIN dans .env (10 par defaut).
 */
const { ErreurApi } = require('../middleware/errorHandler');

const etat = {
  utilise: null,
  restant: null,
  jourUtc: null, // "2026-09-22" : quand le jour UTC change, Spoonacular a remis le quota a zero
};

function jourUtcCourant() {
  return new Date().toISOString().slice(0, 10);
}

function reinitialiserSiNouveauJour() {
  const jour = jourUtcCourant();
  if (etat.jourUtc !== jour) {
    etat.utilise = null;
    etat.restant = null;
    etat.jourUtc = jour;
  }
}

// Appele AVANT chaque appel Spoonacular.
function verifierAvantAppel() {
  reinitialiserSiNouveauJour();
  const seuil = Number(process.env.QUOTA_SEUIL_MIN ?? 10);
  if (etat.restant !== null && etat.restant < seuil) {
    throw new ErreurApi(
      503,
      'QUOTA_EPUISE',
      'Le nombre de plans disponibles aujourd\'hui est atteint. Reessaie demain.'
    );
  }
}

// Appele APRES chaque reponse Spoonacular, meme en erreur (les en-tetes sont souvent presents).
function mettreAJourDepuisEntetes(entetes) {
  reinitialiserSiNouveauJour();
  const utilise = parseFloat(entetes.get('x-api-quota-used'));
  const restant = parseFloat(entetes.get('x-api-quota-left'));
  if (!Number.isNaN(utilise)) etat.utilise = utilise;
  if (!Number.isNaN(restant)) etat.restant = restant;
}

// Spoonacular a repondu 402 : on considere le quota vide jusqu'a minuit UTC.
function marquerEpuise() {
  reinitialiserSiNouveauJour();
  etat.restant = 0;
}

function lireEtat() {
  reinitialiserSiNouveauJour();
  return { ...etat };
}

module.exports = { verifierAvantAppel, mettreAJourDepuisEntetes, marquerEpuise, lireEtat };
