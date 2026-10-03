import AsyncStorage from '@react-native-async-storage/async-storage';

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

export function genererId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
