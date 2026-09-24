import { API_BASE_URL } from '../config';
import { sessionService } from './sessionService';

// Seul point de contact avec le serveur Sofra. Aucun autre fichier
// n'appelle fetch() directement pour parler au serveur.
//
// Le serveur renvoie toujours ses erreurs sous la même forme :
//   { "erreur": { "code": "QUOTA_EPUISE", "message": "..." } }
// On conserve le code sur l'erreur levée (erreur.code) : il permettra
// d'afficher plus tard un message traduit en fr, en ou ar, plutôt que
// le message du serveur.
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
    // Serveur arrêté, mauvaise adresse IP, ou téléphone sur un autre réseau.
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
  // Plan de 7 jours. Renvoie tel quel la réponse du serveur :
  // { carte, genereLe, incomplet, jours: [{ jour, dejeuner, diner, souper }] }
  // Chaque repas ne porte que id, titre et imageUrl (licence Spoonacular).
  async obtenirPlan(carte) {
    return appelJson(`/plan?carte=${encodeURIComponent(carte)}`);
  },

  // Détail d'une recette externe : affiché puis oublié, jamais enregistré.
  // Le champ alerteExclusion liste les termes interdits trouvés dans la
  // recette ; s'il n'est pas vide, il ne faut pas proposer cette recette.
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

  // Vérifie au démarrage que le jeton enregistré est encore valide.
  async obtenirMonCompte() {
    return appelJson('/auth/moi', { avecSession: true });
  },

  // Fil de la communauté, chronologique. Lecture ouverte, sans compte.
  // Renvoie { page, limite, aSuite, recettes }.
  async consulterFil(page = 1, limite = 20) {
    return appelJson(`/fil?page=${page}&limite=${limite}`);
  },

  async lireRecettePubliee(id) {
    return appelJson(`/fil/${id}`);
  },

  // Publie une copie figée d'une recette locale. Compte requis.
  // L'auteur vient du jeton, jamais du corps de la requête.
  async publierRecette(recette) {
    return appelJson('/fil', { methode: 'POST', corps: recette, avecSession: true });
  }
};
