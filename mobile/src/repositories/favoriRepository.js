import { CLES, ecrire, genererId, lire } from '../db/storage';

export const favoriRepository = {
  async ajouter(recetteId, recetteExterneId) {
    const favoris = await lire(CLES.FAVORIS, []);
    const nouveau = {
      id: genererId(),
      recetteId: recetteId ?? null,
      recetteExterneId: recetteExterneId ?? null,
      dateAjout: new Date().toISOString()
    };
    await ecrire(CLES.FAVORIS, [...favoris, nouveau]);
  },

  async retirer(id) {
    const favoris = await lire(CLES.FAVORIS, []);
    await ecrire(CLES.FAVORIS, favoris.filter((f) => f.id !== id));
  },

  async lister() {
    const favoris = await lire(CLES.FAVORIS, []);
    return [...favoris].sort((a, b) => b.dateAjout.localeCompare(a.dateAjout));
  }
};
