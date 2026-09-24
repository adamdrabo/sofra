import { CLES, ecrire, genererId, lire } from '../db/storage';

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
        id: genererId(),
        ingredientId: l.ingredientId,
        quantite: l.quantite,
        codeUnite: l.codeUnite,
        prixUnitaire: l.prixUnitaire,
        sourcePrix: l.sourcePrix,
        sousTotal: l.sousTotal,
        estAchete: false
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

  // Applique un prix saisi par la personne a une ligne : le sous-total
  // de la ligne et le montant estime de la liste suivent, sinon le total
  // affiche ne correspondrait plus a la somme des lignes.
  async majPrixLigne(listeCoursesId, ligneId, prixUnitaire, sourcePrix) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    const misesAJour = listes.map((l) => {
      if (l.id !== listeCoursesId) return l;
      const lignes = l.lignes.map((ligne) =>
        ligne.id === ligneId
          ? { ...ligne, prixUnitaire, sourcePrix, sousTotal: Math.round(ligne.quantite * prixUnitaire * 100) / 100 }
          : ligne
      );
      const montantEstime = Math.round(lignes.reduce((somme, ligne) => somme + ligne.sousTotal, 0) * 100) / 100;
      return { ...l, lignes, montantEstime };
    });
    await ecrire(CLES.LISTES_COURSES, misesAJour);
  },

  async enregistrerMontantReel(listeCoursesId, montantReel) {
    const listes = await lire(CLES.LISTES_COURSES, []);
    await ecrire(CLES.LISTES_COURSES, listes.map((l) => (l.id === listeCoursesId ? { ...l, montantReel } : l)));
  }
};