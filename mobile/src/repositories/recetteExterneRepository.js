import { CLES, ecrire, genererId, lire } from '../db/storage';

// Seuls id, titre et image sont conserves pour une recette venue de
// Spoonacular (voir "Ce que RECETTE_EXTERNE ne contient pas").
// Les ingredients et les etapes ne sont jamais enregistres : ils sont
// demandes au serveur au moment de l'affichage, puis oublies.
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
