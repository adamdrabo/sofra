const quota = require('./quotaService');
const { ErreurApi } = require('../middleware/errorHandler');

const URL_BASE = 'https://api.spoonacular.com';
const DELAI_MAX_MS = 8000;
const ECART_MIN_MS = 1100; 

const PARAMETRES_PAR_CARTE = {
  EQUILIBRE: {},
  RAPIDE: { maxReadyTime: 30 }, 
  PROTEINES: { minProtein: 25 }, 
};

let derniereFin = Promise.resolve();
let dernierDepart = 0;

function planifier(tache) {
  const execution = derniereFin.then(async () => {
    const attente = dernierDepart + ECART_MIN_MS - Date.now();
    if (attente > 0) await new Promise((r) => setTimeout(r, attente));
    dernierDepart = Date.now();
    return tache();
  });
 
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


async function rechercherRecettes({ type, nombre, carte, excludeIngredients }) {
  const donnees = await appeler('/recipes/complexSearch', {
    type,
    number: nombre,
    sort: 'random', 
    instructionsRequired: true, 
    excludeIngredients,
    ...PARAMETRES_PAR_CARTE[carte],
  });

  return (donnees.results || []).map((r) => ({ id: r.id, titre: r.title, imageUrl: r.image || null }));
}


async function obtenirRecette(id) {
  return appeler(`/recipes/${id}/information`, { includeNutrition: false });
}

module.exports = { rechercherRecettes, obtenirRecette, PARAMETRES_PAR_CARTE };
