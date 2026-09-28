const { ErreurApi } = require('../middleware/errorHandler');

const etat = {
  utilise: null,
  restant: null,
  jourUtc: null, 
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

function mettreAJourDepuisEntetes(entetes) {
  reinitialiserSiNouveauJour();
  const utilise = parseFloat(entetes.get('x-api-quota-used'));
  const restant = parseFloat(entetes.get('x-api-quota-left'));
  if (!Number.isNaN(utilise)) etat.utilise = utilise;
  if (!Number.isNaN(restant)) etat.restant = restant;
}

function marquerEpuise() {
  reinitialiserSiNouveauJour();
  etat.restant = 0;
}

function lireEtat() {
  reinitialiserSiNouveauJour();
  return { ...etat };
}

module.exports = { verifierAvantAppel, mettreAJourDepuisEntetes, marquerEpuise, lireEtat };
