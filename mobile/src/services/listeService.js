import { planRepository } from '../repositories/planRepository';
import { recetteRepository } from '../repositories/recetteRepository';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { coursesRepository } from '../repositories/coursesRepository';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { calculerQuantitePourRepas, obtenirPrixRetenu } from './coutService';

// Realise le cas d'utilisation "Preparer sa liste d'epicerie".
// Applique les regles de calcul du document v5, section 10 :
//
//   quantite du repas = quantite_recette x (portions_repas / portions_recette)
//   normalisation     = quantite x UNITE.facteurVersBase
//   agregation        = par (ingredientId, codeUniteBase)
//   prix retenu       = PRIX_PERSONNALISE le plus recent, sinon PRIX_REFERENCE actif
//
// Portee volontairement limitee : seules les recettes locales entrent dans
// la liste et dans le total. Un repas venu de l'API n'a pas d'ingredients
// sur l'appareil (la licence interdit de les conserver), il est donc compte
// dans recettesNonChiffrees et exclu du calcul. C'est ce qui permet a l'ecran
// d'annoncer "cette liste couvre 4 repas sur 21" plutot qu'un total faux.
export async function genererListeDuPlan(planHebdoId) {
  const [repas, unites, preference] = await Promise.all([
    planRepository.listerRepas(planHebdoId),
    referentielsRepository.listerUnites(),
    preferenceRepository.obtenir()
  ]);

  const uniteParCode = new Map(unites.map((u) => [u.code, u]));

  // Une meme recette peut revenir plusieurs fois dans la semaine :
  // on ne la lit qu'une fois.
  const recettesParId = new Map();
  async function obtenirRecette(id) {
    if (!recettesParId.has(id)) recettesParId.set(id, await recetteRepository.obtenirParId(id));
    return recettesParId.get(id);
  }

  const agregat = new Map(); // "ingredientId|codeUniteBase" -> { ingredientId, codeUnite, quantite }
  let recettesNonChiffrees = 0;
  let repasChiffres = 0;

  for (const r of repas) {
    if (!r.recetteId) {
      recettesNonChiffrees += 1;
      continue;
    }

    const recette = await obtenirRecette(r.recetteId);
    // Recette supprimee depuis la creation du plan : on ne peut pas la chiffrer.
    if (!recette || !recette.nombrePortions) {
      recettesNonChiffrees += 1;
      continue;
    }

    repasChiffres += 1;

    for (const ing of recette.ingredients) {
      const quantiteRepas = calculerQuantitePourRepas(ing.quantite, r.nombrePortions, recette.nombrePortions);

      // Unite inconnue du referentiel : on la garde telle quelle avec un
      // facteur de 1, plutot que de perdre la ligne.
      const unite = uniteParCode.get(ing.codeUnite);
      const codeUniteBase = unite ? unite.codeUniteBase : ing.codeUnite;
      const quantiteBase = quantiteRepas * (unite ? unite.facteurVersBase : 1);

      const cle = `${ing.ingredientId}|${codeUniteBase}`;
      const existante = agregat.get(cle);
      if (existante) {
        existante.quantite += quantiteBase;
      } else {
        agregat.set(cle, { ingredientId: ing.ingredientId, codeUnite: codeUniteBase, quantite: quantiteBase });
      }
    }
  }

  const lignes = [];
  let montantEstime = 0;

  for (const ligne of agregat.values()) {
    const { prixUnitaire, sourcePrix } = await obtenirPrixRetenu(ligne.ingredientId);
    const quantite = arrondir(ligne.quantite);
    const sousTotal = arrondir(quantite * prixUnitaire);
    montantEstime += sousTotal;
    lignes.push({ ...ligne, quantite, prixUnitaire, sourcePrix, sousTotal });
  }

  const listeCoursesId = await coursesRepository.creerListe(
    planHebdoId,
    arrondir(montantEstime),
    recettesNonChiffrees,
    preference.deviseCode,
    lignes
  );

  return {
    listeCoursesId,
    repasChiffres,
    recettesNonChiffrees,
    totalRepas: repas.length,
    montantEstime: arrondir(montantEstime)
  };
}

// Deux decimales : au-dela, l'ecran afficherait des quantites du genre
// 333.33333333 g, et les sous-totaux ne se rejoindraient pas a l'addition.
function arrondir(valeur) {
  return Math.round(valeur * 100) / 100;
}