import { planRepository } from '../repositories/planRepository';
import { recetteRepository } from '../repositories/recetteRepository';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { coursesRepository } from '../repositories/coursesRepository';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { calculerQuantitePourRepas, obtenirPrixRetenu } from './coutService';

export async function genererListeDuPlan(planHebdoId) {
  const [repas, unites, preference, listeExistante] = await Promise.all([
    planRepository.listerRepas(planHebdoId),
    referentielsRepository.listerUnites(),
    preferenceRepository.obtenir(),
    coursesRepository.obtenirParPlan(planHebdoId)
  ]);

  const uniteParCode = new Map(unites.map((u) => [u.code, u]));

  const recettesParId = new Map();
  async function obtenirRecette(id) {
    if (!recettesParId.has(id)) recettesParId.set(id, await recetteRepository.obtenirParId(id));
    return recettesParId.get(id);
  }

  const agregat = new Map(); 
  let recettesNonChiffrees = 0;
  let repasChiffres = 0;

  for (const r of repas) {
    if (!r.recetteId) {
      recettesNonChiffrees += 1;
      continue;
    }

    const recette = await obtenirRecette(r.recetteId);
   
    if (!recette || !recette.nombrePortions) {
      recettesNonChiffrees += 1;
      continue;
    }

    repasChiffres += 1;

    for (const ing of recette.ingredients) {
      const quantiteRepas = calculerQuantitePourRepas(ing.quantite, r.nombrePortions, recette.nombrePortions);

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

  const lignesManuelles = (listeExistante?.lignes ?? []).filter((l) => l.provenance === 'MANUELLE');

  const lignes = [...lignesManuelles];
  let montantEstime = lignesManuelles.reduce((somme, l) => somme + l.sousTotal, 0);

  for (const ligne of agregat.values()) {
    const { prixUnitaire, sourcePrix } = await obtenirPrixRetenu(ligne.ingredientId);
    const quantite = arrondir(ligne.quantite);
    const sousTotal = arrondir(quantite * prixUnitaire);
    montantEstime += sousTotal;
    lignes.push({ ...ligne, quantite, prixUnitaire, sourcePrix, sousTotal, facteurVersBase: 1, provenance: 'PLAN' });
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

function arrondir(valeur) {
  return Math.round(valeur * 100) / 100;
}
