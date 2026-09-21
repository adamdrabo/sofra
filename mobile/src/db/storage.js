import AsyncStorage from '@react-native-async-storage/async-storage';

// Unique porte d'entree vers le stockage local. Personne d'autre
// n'appelle AsyncStorage directement (voir composant "Acces aux
// donnees locales" : une porte d'entree par ensemble, document v5).
export async function lire(cle, valeurParDefaut) {
  const brut = await AsyncStorage.getItem(cle);
  if (brut === null) return valeurParDefaut;
  return JSON.parse(brut);
}

export async function ecrire(cle, valeur) {
  await AsyncStorage.setItem(cle, JSON.stringify(valeur));
}

export async function effacerTout() {
  await AsyncStorage.multiRemove(Object.values(CLES));
}

// Une cle par paquet du modele de donnees. Chaque cle contient un
// objet ou un tableau JSON complet (pas de jointures : les sous-listes
// sont imbriquees directement, ex. une recette porte ses ingredients
// et ses etapes).
export const CLES = {
  PREFERENCE: 'sofra.preference',
  UNITES: 'sofra.unites',
  CATEGORIES: 'sofra.categories',
  INGREDIENTS: 'sofra.ingredients',
  RECETTES: 'sofra.recettes',
  RECETTES_EXTERNES: 'sofra.recettesExternes',
  FAVORIS: 'sofra.favoris',
  PLANS_HEBDO: 'sofra.plansHebdo',
  PRIX_REFERENCE: 'sofra.prixReference',
  PRIX_PERSONNALISE: 'sofra.prixPersonnalise',
  LISTES_COURSES: 'sofra.listesCourses'
};

// Genere un identifiant local. Une horloge + un peu d'aleatoire suffit
// largement pour un seul appareil, une seule personne (voir "Un seul
// profil par appareil" dans le document v5).
export function genererId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
