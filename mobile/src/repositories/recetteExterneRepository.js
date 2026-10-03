import { CLES, ecrire, genererId, lire } from '../db/storage';

export const recetteExterneRepository = {
  async lister() {
    return lire(CLES.RECETTES_EXTERNES, []);
  },

  async obtenirParId(id) {
    const recettes = await lire(CLES.RECETTES_EXTERNES, []);
    return recettes.find((r) => r.id === id) ?? null;
  },

  async trouverOuCreer(recette) {
    const recettes = await lire(CLES.RECETTES_EXTERNES, []);
    const maintenant = new Date().toISOString();

    const existante = recettes.find((r) => r.cleApiExterne === recette.cleApiExterne);
    if (existante) {
      const misAJour = { ...existante, dateVue: maintenant };
      await ecrire(CLES.RECETTES_EXTERNES, recettes.map((r) => (r.id === existante.id ? misAJour : r)));
      return misAJour;
    }

    const nouvelle = {
      id: genererId(),
      cleApiExterne: recette.cleApiExterne,
      titre: recette.titre,
      imageUrl: recette.imageUrl,
      dateVue: maintenant
    };
    await ecrire(CLES.RECETTES_EXTERNES, [...recettes, nouvelle]);
    return nouvelle;
  }
};
