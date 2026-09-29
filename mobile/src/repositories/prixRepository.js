import { CLES, ecrire, lire } from '../db/storage';

export const prixRepository = {
  async obtenirPrixReferenceActif(ingredientId) {
    const prix = await lire(CLES.PRIX_REFERENCE, []);
    const actifs = prix
      .filter((p) => p.ingredientId === ingredientId && p.estActif)
      .sort((a, b) => b.dateReleve.localeCompare(a.dateReleve));
    return actifs[0] ?? null;
  },

  async obtenirPrixPersonnalisePlusRecent(ingredientId) {
    const prix = await lire(CLES.PRIX_PERSONNALISE, []);
    const trouves = prix
      .filter((p) => p.ingredientId === ingredientId)
      .sort((a, b) => b.dateReleve.localeCompare(a.dateReleve));
    return trouves[0] ?? null;
  },

  async ajouterPrixPersonnalise(ingredientId, prixValeur, quantite, codeUnite, magasin) {
    const prix = await lire(CLES.PRIX_PERSONNALISE, []);
    const dateReleve = new Date().toISOString().slice(0, 10);

    const sansDoublon = prix.filter((p) => !(p.ingredientId === ingredientId && p.dateReleve === dateReleve));
    const nouveau = {
      id: Date.now(),
      ingredientId,
      prix: prixValeur,
      quantite,
      codeUnite,
      magasin: magasin ?? null,
      dateReleve
    };
    await ecrire(CLES.PRIX_PERSONNALISE, [...sansDoublon, nouveau]);
  }
};
