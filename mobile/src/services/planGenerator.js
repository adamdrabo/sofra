import { clientSofra } from './clientSofra';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { recetteExterneRepository } from '../repositories/recetteExterneRepository';
import { planRepository } from '../repositories/planRepository';

const TYPES_REPAS = ['DEJEUNER', 'DINER', 'SOUPER'];

// Realise le cas d'utilisation "Obtenir un plan de 7 jours" : demande
// des recettes filtrees au serveur, les enregistre en RECETTE_EXTERNE,
// puis construit un plan de 7 jours x 3 repas.
export async function genererPlanDeLaSemaine() {
  const preference = await preferenceRepository.obtenir();
  const recettesApi = await clientSofra.obtenirRecettesFiltrees(preference.carte, preference.langue);

  const nombreCasesNecessaires = 7 * TYPES_REPAS.length;
  if (recettesApi.length < nombreCasesNecessaires) {
    throw new Error("Pas assez de recettes retournées pour remplir la semaine");
  }

  const repas = [];
  let index = 0;
  for (let jour = 1; jour <= 7; jour++) {
    for (const typeRepas of TYPES_REPAS) {
      const recetteApi = recettesApi[index];
      const recetteExterne = await recetteExterneRepository.trouverOuCreer(recetteApi);
      repas.push({
        jourSemaine: jour,
        typeRepas,
        recetteExterneId: recetteExterne.id,
        nombrePortions: preference.nombrePersonnes
      });
      index++;
    }
  }

  return planRepository.creerPlan(preference.nombrePersonnes, preference.carte, preference.deviseCode, repas);
}
