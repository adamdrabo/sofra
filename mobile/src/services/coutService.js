import { prixRepository } from '../repositories/prixRepository';

// "Le PRIX_PERSONNALISE le plus recent, a defaut la ligne PRIX_REFERENCE
// active." Le prix retourne est ramene a 1 unite de base pour simplifier
// le calcul du sous-total.
export async function obtenirPrixRetenu(ingredientId) {
  const personnalise = await prixRepository.obtenirPrixPersonnalisePlusRecent(ingredientId);
  if (personnalise) {
    return { prixUnitaire: personnalise.prix / personnalise.quantite, sourcePrix: 'PERSONNALISE' };
  }

  const reference = await prixRepository.obtenirPrixReferenceActif(ingredientId);
  if (reference) {
    return { prixUnitaire: reference.prix / reference.quantite, sourcePrix: 'REFERENCE' };
  }

  // Aucun prix connu : on retourne 0 plutot que de faire planter le calcul,
  // a afficher clairement a l'ecran comme "prix inconnu".
  return { prixUnitaire: 0, sourcePrix: 'REFERENCE' };
}

// quantite_recette x (nombrePortions_repas / nombrePortions_recette)
export function calculerQuantitePourRepas(quantiteRecette, nombrePortionsRepas, nombrePortionsRecette) {
  return quantiteRecette * (nombrePortionsRepas / nombrePortionsRecette);
}
