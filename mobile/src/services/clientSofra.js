import { API_BASE_URL } from '../config';
import { sessionService } from './sessionService';

async function appelJson(chemin, options = {}) {
  const { methode = 'GET', corps, avecSession = false } = options;

  const enTetes = { 'Content-Type': 'application/json' };
  if (avecSession) {
    const jeton = await sessionService.obtenirJeton();
    if (!jeton) throw new Error('Session requise');
    enTetes.Authorization = `Bearer ${jeton}`;
  }

  let reponse;
  try {
    reponse = await fetch(`${API_BASE_URL}${chemin}`, {
      method: methode,
      headers: enTetes,
      body: corps ? JSON.stringify(corps) : undefined
    });
  } catch {
    
    const erreur = new Error('Serveur injoignable. Vérifie que le serveur tourne et que le téléphone est sur le même wifi.');
    erreur.code = 'SERVEUR_INJOIGNABLE';
    throw erreur;
  }

  if (!reponse.ok) {
    const donnees = await reponse.json().catch(() => ({}));
    const erreur = new Error(donnees.erreur?.message ?? `Erreur ${reponse.status}`);
    erreur.code = donnees.erreur?.code ?? `HTTP_${reponse.status}`;
    throw erreur;
  }

  return reponse.json();
}

export const clientSofra = {

  async obtenirPlan(carte) {
    return appelJson(`/plan?carte=${encodeURIComponent(carte)}`);
  },

  async obtenirDetailRecette(idExterne) {
    return appelJson(`/plan/recettes/${idExterne}`);
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

  
  async obtenirMonCompte() {
    return appelJson('/auth/moi', { avecSession: true });
  },

  
  async consulterFil(page = 1, limite = 20) {
    return appelJson(`/fil?page=${page}&limite=${limite}`);
  },

  async lireRecettePubliee(id) {
    return appelJson(`/fil/${id}`);
  },

  async publierRecette(recette) {
    return appelJson('/fil', { methode: 'POST', corps: recette, avecSession: true });
  }
};
