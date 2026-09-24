import { clientSofra } from './clientSofra';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { recetteExterneRepository } from '../repositories/recetteExterneRepository';
import { planRepository } from '../repositories/planRepository';

// Le serveur renvoie les repas sous ces trois noms ; le stockage local
// utilise les siens. Cette table fait la correspondance.
const REPAS_SERVEUR = [
  ['dejeuner', 'DEJEUNER'],
  ['diner', 'DINER'],
  ['souper', 'SOUPER']
];

// Réalise le cas d'utilisation « Obtenir un plan de 7 jours » : demande
// un plan filtré au serveur, enregistre chaque recette en RECETTE_EXTERNE,
// puis construit le plan de 7 jours x 3 repas dans le stockage local.
export async function genererPlanDeLaSemaine() {
  const preference = await preferenceRepository.obtenir();
  const plan = await clientSofra.obtenirPlan(preference.carte);

  const repas = [];
  for (const jour of plan.jours) {
    for (const [champServeur, typeRepas] of REPAS_SERVEUR) {
      const recetteApi = jour[champServeur];
      // Une case peut être vide si le serveur a manqué de recettes
      // pour cette carte : on la saute plutôt que de bloquer le plan.
      if (!recetteApi) continue;

      const recetteExterne = await recetteExterneRepository.trouverOuCreer({
        // L'identifiant Spoonacular est un nombre ; on le garde en texte
        // pour que la comparaison avec les recettes déjà vues soit fiable.
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

  // incomplet vaut true quand le serveur a dû répéter des recettes :
  // l'écran peut le signaler à la personne.
  return { planHebdoId, incomplet: plan.incomplet };
}
