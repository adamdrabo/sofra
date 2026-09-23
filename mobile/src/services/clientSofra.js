import { API_BASE_URL } from '../config';
import { sessionService } from './sessionService';

// Seul point de contact avec le serveur Sofra. Aucun autre fichier
// n'appelle fetch() directement pour parler au serveur.
async function appelJson(chemin, options = {}) {
  const { methode = 'GET', corps, avecSession = false } = options;

  const enTetes = { 'Content-Type': 'application/json' };
  if (avecSession) {
    const jeton = await sessionService.obtenirJeton();
    if (!jeton) throw new Error('Session requise');
    enTetes.Authorization = `Bearer ${jeton}`;
  }

  const reponse = await fetch(`${API_BASE_URL}${chemin}`, {
    method: methode,
    headers: enTetes,
    body: corps ? JSON.stringify(corps) : undefined
  });

  if (!reponse.ok) {
    const donnees = await reponse.json().catch(() => ({}));
    throw new Error(donnees.erreur || `Erreur ${reponse.status}`);
  }

  return reponse.json();
}

export const clientSofra = {
  async obtenirRecettesFiltrees(carte, langue) {
    const { recettes } = await appelJson('/plan/recettes', {
      methode: 'POST',
      corps: { carte, langue }
    });
    return recettes;
  },

  async inscription(courriel, motDePasse, nomAffiche, langue) {
    return appelJson('/auth/inscription', {
      methode: 'POST',
      corps: { courriel, motDePasse, nomAffiche, langue }
    });
  },

  async connexion(courriel, motDePasse) {
    return appelJson('/auth/connexion', {
      methode: 'POST',
      corps: { courriel, motDePasse }
    });
  },

};
