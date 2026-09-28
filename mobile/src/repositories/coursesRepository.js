import { CLES, ecrire, genererId, lire } from '../db/storage';

// Le prix d'un ingredient est toujours exprime par unite de BASE
// (le gramme, le millilitre, la piece). Une ligne affichee en kg doit
// donc etre ramenee en grammes avant d'etre multipliee par le prix.
function recalculer(ligne) {
  const quantiteEnBase = ligne.quantite * (ligne.facteurVersBase ?? 1);
  return { ...ligne, sousTotal: Math.round(quantiteEnBase * ligne.prixUnitaire * 100) / 100 };
}

function totaliser(lignes) {
  return Math.round(lignes.reduce((somme, ligne) => somme + ligne.sousTotal, 0) * 100) / 100;
}

export const coursesRepository = {
  async creerListe(planHebdoId, montantEstime, recettesNonChiffrees, deviseCode, lignes) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    const id = genererId();

    const nouvelle = {
      id,
      planHebdoId,
      dateGeneration: new Date().toISOString(),
      montantEstime,
      montantReel: null,
      recettesNonChiffrees,
      deviseCode,
      lignes: lignes.map((l) => ({
        id: l.id ?? genererId(),
        ingredientId: l.ingredientId,
        quantite: l.quantite,
        codeUnite: l.codeUnite,
        // Facteur vers l'unite de base, garde sur la ligne pour que le
        // sous-total reste juste si la personne change d'unite (kg -> g).
        facteurVersBase: l.facteurVersBase ?? 1,
        prixUnitaire: l.prixUnitaire,
        sourcePrix: l.sourcePrix,
        sousTotal: l.sousTotal,
        // PLAN : calculee depuis les recettes, remplacee a chaque
        // regeneration. MANUELLE : ajoutee a la main, conservee.
        provenance: l.provenance ?? 'PLAN',
        estAchete: l.estAchete ?? false
      }))
    };

    // Une seule liste par plan : on remplace si elle existait déjà.
    const sansAncienne = listes.filter((l) => l.planHebdoId !== planHebdoId);
    await ecrire(CLES.LISTES_COURSES, [...sansAncienne, nouvelle]);
    return id;
  },

  async obtenirParPlan(planHebdoId) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    return listes.find((l) => l.planHebdoId === planHebdoId) ?? null;
  },

  async listerLignes(listeCoursesId) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    return listes.find((l) => l.id === listeCoursesId)?.lignes ?? [];
  },

  async cocherLigne(listeCoursesId, ligneId, estAchete) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    const misesAJour = listes.map((l) =>
      l.id === listeCoursesId
        ? { ...l, lignes: l.lignes.map((ligne) => (ligne.id === ligneId ? { ...ligne, estAchete } : ligne)) }
        : l
    );
    await ecrire(CLES.LISTES_COURSES, misesAJour);
  },

  // Modifie une ligne : quantite, unite, prix, ou plusieurs a la fois.
  // Le sous-total et le montant estime de la liste suivent, sinon le
  // total affiche ne correspondrait plus a la somme des lignes.
  async majLigne(listeCoursesId, ligneId, champs) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    const misesAJour = listes.map((l) => {
      if (l.id !== listeCoursesId) return l;
      const lignes = l.lignes.map((ligne) => (ligne.id === ligneId ? recalculer({ ...ligne, ...champs }) : ligne));
      return { ...l, lignes, montantEstime: totaliser(lignes) };
    });
    await ecrire(CLES.LISTES_COURSES, misesAJour);
  },

  // Article ajoute a la main : il ne vient d'aucune recette du plan et
  // survit aux regenerations de la liste (voir listeService).
  async ajouterLigne(listeCoursesId, ligne) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    const misesAJour = listes.map((l) => {
      if (l.id !== listeCoursesId) return l;
      const nouvelle = recalculer({
        id: genererId(),
        ingredientId: ligne.ingredientId,
        quantite: ligne.quantite,
        codeUnite: ligne.codeUnite,
        facteurVersBase: ligne.facteurVersBase ?? 1,
        prixUnitaire: ligne.prixUnitaire,
        sourcePrix: ligne.sourcePrix,
        provenance: 'MANUELLE',
        estAchete: false
      });
      const lignes = [...l.lignes, nouvelle];
      return { ...l, lignes, montantEstime: totaliser(lignes) };
    });
    await ecrire(CLES.LISTES_COURSES, misesAJour);
  },

  async supprimerLigne(listeCoursesId, ligneId) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    const misesAJour = listes.map((l) => {
      if (l.id !== listeCoursesId) return l;
      const lignes = l.lignes.filter((ligne) => ligne.id !== ligneId);
      return { ...l, lignes, montantEstime: totaliser(lignes) };
    });
    await ecrire(CLES.LISTES_COURSES, misesAJour);
  },

  async enregistrerMontantReel(listeCoursesId, montantReel) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    await ecrire(CLES.LISTES_COURSES, listes.map((l) => (l.id === listeCoursesId ? { ...l, montantReel } : l)));
  }
};
