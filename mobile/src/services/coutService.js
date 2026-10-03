import { prixRepository } from '../repositories/prixRepository';

export async function obtenirPrixRetenu(ingredientId) {
  const personnalise = await prixRepository.obtenirPrixPersonnalisePlusRecent(ingredientId);
  if (personnalise) {
    return { prixUnitaire: personnalise.prix / personnalise.quantite, sourcePrix: 'PERSONNALISE' };
  }

  const reference = await prixRepository.obtenirPrixReferenceActif(ingredientId);
  if (reference) {
    return { prixUnitaire: reference.prix / reference.quantite, sourcePrix: 'REFERENCE' };
  }

  return { prixUnitaire: 0, sourcePrix: 'REFERENCE' };
}

export function calculerQuantitePourRepas(quantiteRecette, nombrePortionsRepas, nombrePortionsRecette) {
  return quantiteRecette * (nombrePortionsRepas / nombrePortionsRecette);
}
