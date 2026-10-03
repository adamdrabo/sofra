import { clientSofra } from './clientSofra';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { recetteExterneRepository } from '../repositories/recetteExterneRepository';
import { planRepository } from '../repositories/planRepository';

const REPAS_SERVEUR = [
  ['dejeuner', 'DEJEUNER'],
  ['diner', 'DINER'],
  ['souper', 'SOUPER']
];

export async function genererPlanDeLaSemaine() {
  const preference = await preferenceRepository.obtenir();
  const plan = await clientSofra.obtenirPlan(preference.carte);

  const repas = [];
  for (const jour of plan.jours) {
    for (const [champServeur, typeRepas] of REPAS_SERVEUR) {
      const recetteApi = jour[champServeur];
     
      if (!recetteApi) continue;

      const recetteExterne = await recetteExterneRepository.trouverOuCreer({
       
        cleApiExterne: String(recetteApi.id),
        titre: recetteApi.titre,
        imageUrl: recetteApi.imageUrl
      });

      repas.push({
        jourSemaine: jour.jour,
        typeRepas,
        recetteExterneId: recetteExterne.id,
        nombrePortions: preference.nombrePersonnes
      });
    }
  }

  if (repas.length === 0) {
    throw new Error('Aucune recette reçue pour cette carte.');
  }

  const planHebdoId = await planRepository.creerPlan(
    preference.nombrePersonnes,
    preference.carte,
    preference.deviseCode,
    repas
  );

  return { planHebdoId, incomplet: plan.incomplet };
}
