/**
 * POURQUOI CE FICHIER
 * Composant "Passerelle Spoonacular" du C4 niveau 3 serveur. C'est la raison pour laquelle
 * le serveur existe : la cle API ne peut pas vivre dans l'application Expo (tout ce qui est
 * embarque dans l'app est extractible). L'app parle au serveur, le serveur parle a Spoonacular.
 *
 * CE QUE LA PASSERELLE NE FAIT PAS
 * Elle ne met RIEN en cache, meme si deux personnes demandent la meme recette a une minute
 * d'intervalle. C'est la licence Spoonacular qui l'interdit (stockage permanent limite a
 * id, titre, image), pas un choix technique. Elle protege la cle et mesure la consommation.
 *
 * CONTEXTE, ERREURS PROBABLES ET LEUR TRADUCTION
 * - 401 : cle absente ou invalide -> 502 SPOONACULAR_CONFIG (on logue la vraie cause).
 * - 402 : quota du jour epuise -> 503 QUOTA_EPUISE.
 * - 404 : recette inconnue -> 404 RECETTE_INTROUVABLE.
 * - 429 : trop de requetes par seconde -> 503 SPOONACULAR_OCCUPE.
 * - Pas de reponse en 8 s -> 504 SPOONACULAR_DELAI.
 * - Reseau coupe, DNS -> 502 SPOONACULAR_INJOIGNABLE.
 * Le palier gratuit accepte environ 1 requete par seconde : les appels passent donc par
 * une file qui les espace (voir planifier()). Sans elle, les appels d'un meme plan
 * pourraient se faire refuser en 429.
 */
const quota = require('./quotaService');
const { ErreurApi } = require('../middleware/errorHandler');

const URL_BASE = 'https://api.spoonacular.com';
const DELAI_MAX_MS = 8000;
const ECART_MIN_MS = 1100; // un peu plus d'une seconde entre deux appels

// Traduction des cartes de plan en parametres d'appel (modele v5, section 09).
// Les seuils sont des choix d'equipe, a ajuster apres les premiers essais :
// si "Rapide" renvoie trop peu de recettes, augmenter maxReadyTime.
const PARAMETRES_PAR_CARTE = {
  EQUILIBRE: {},
  RAPIDE: { maxReadyTime: 30 }, // minutes
  PROTEINES: { minProtein: 25 }, // grammes par portion
};

// --- File d'attente : un appel a la fois, espaces d'au moins ECART_MIN_MS ---
let derniereFin = Promise.resolve();
let dernierDepart = 0;

function planifier(tache) {
  const execution = derniereFin.then(async () => {
    const attente = dernierDepart + ECART_MIN_MS - Date.now();
    if (attente > 0) await new Promise((r) => setTimeout(r, attente));
    dernierDepart = Date.now();
    return tache();
  });
  // Une erreur ne doit pas bloquer la file pour les appels suivants.
  derniereFin = execution.catch(() => {});
  return execution;
}

async function appeler(chemin, parametres = {}) {
  quota.verifierAvantAppel();

  const url = new URL(chemin, URL_BASE);
  for (const [cle, valeur] of Object.entries(parametres)) {
    if (valeur !== undefined && valeur !== null && valeur !== '') url.searchParams.set(cle, String(valeur));
  }

  return planifier(async () => {
    let reponse;
    try {
      reponse = await fetch(url, {
        // La cle passe en en-tete plutot que dans l'URL : les URL finissent dans les logs.
        headers: { 'x-api-key': process.env.SPOONACULAR_KEY, Accept: 'application/json' },
        signal: AbortSignal.timeout(DELAI_MAX_MS),
      });
    } catch (err) {
      if (err.name === 'TimeoutError') {
        throw new ErreurApi(504, 'SPOONACULAR_DELAI', 'Le service de recettes met trop de temps a repondre.');
      }
      console.error('[spoonacular] reseau :', err.message);
      throw new ErreurApi(502, 'SPOONACULAR_INJOIGNABLE', 'Le service de recettes est injoignable.');
    }

    quota.mettreAJourDepuisEntetes(reponse.headers);

    if (reponse.ok) return reponse.json();

    switch (reponse.status) {
      case 401:
        console.error('[spoonacular] 401 : SPOONACULAR_KEY absente ou invalide dans .env');
        throw new ErreurApi(502, 'SPOONACULAR_CONFIG', 'Le service de recettes est mal configure.');
      case 402:
        quota.marquerEpuise();
        throw new ErreurApi(503, 'QUOTA_EPUISE', 'Le nombre de plans disponibles aujourd\'hui est atteint. Reessaie demain.');
      case 404:
        throw new ErreurApi(404, 'RECETTE_INTROUVABLE', 'Recette introuvable.');
      case 429:
        throw new ErreurApi(503, 'SPOONACULAR_OCCUPE', 'Le service de recettes est occupe, reessaie dans un instant.');
      default:
        console.error('[spoonacular] statut inattendu', reponse.status, await reponse.text().catch(() => ''));
        throw new ErreurApi(502, 'SPOONACULAR_ERREUR', 'Le service de recettes a renvoye une erreur.');
    }
  });
}

/**
 * Recherche de recettes pour un type de repas.
 * type : "breakfast" ou "main course" (vocabulaire Spoonacular).
 * Ne renvoie que ce que la licence permet de garder : id, titre, image.
 */
async function rechercherRecettes({ type, nombre, carte, excludeIngredients }) {
  const donnees = await appeler('/recipes/complexSearch', {
    type,
    number: nombre,
    sort: 'random', // deux plans successifs ne doivent pas etre identiques
    instructionsRequired: true, // une recette sans etapes est inutilisable a l'ecran
    excludeIngredients,
    ...PARAMETRES_PAR_CARTE[carte],
  });

  return (donnees.results || []).map((r) => ({ id: r.id, titre: r.title, imageUrl: r.image || null }));
}

// Detail d'une recette : affiche puis oublie (jamais ecrit en base).
async function obtenirRecette(id) {
  return appeler(`/recipes/${id}/information`, { includeNutrition: false });
}

module.exports = { rechercherRecettes, obtenirRecette, PARAMETRES_PAR_CARTE };
