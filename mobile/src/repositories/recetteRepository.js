import { CLES, ecrire, genererId, lire } from '../db/storage';

// Dans un stockage clé-valeur, la recette porte directement ses
// ingrédients et ses étapes (pas de jointure) : c'est cette forme
// imbriquée qu'on enregistre sous CLES.RECETTES.
async function listerTout() {
  return lire(CLES.RECETTES, []);
}

export const recetteRepository = {
  async lister() {
    const recettes = await listerTout();
    return [...recettes].sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  },

  async obtenirParId(id) {
    const recettes = await listerTout();
    return recettes.find((r) => r.id === id) ?? null;
  },

  async creer(recette) {
    const recettes = await listerTout();
    const maintenant = new Date().toISOString();
    const id = genererId();

    const nouvelle = {
      id,
      categorieId: recette.categorieId,
      recetteParenteId: recette.recetteParenteId ?? null,
      origineCommunaute: recette.origineCommunaute ?? null,
      nomFr: recette.nomFr,
      emoji: recette.emoji ?? null,
      nombrePortions: recette.nombrePortions,
      tempsPreparation: recette.tempsPreparation,
      dateCreation: maintenant,
      dateMaj: maintenant,
      ingredients: recette.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantite: ing.quantite,
        codeUnite: ing.codeUnite,
        estFacultatif: ing.estFacultatif ?? false
      })),
      etapes: recette.etapes.map((texte, index) => ({ ordre: index + 1, texteFr: texte }))
    };

    await ecrire(CLES.RECETTES, [...recettes, nouvelle]);
    return nouvelle;
  },

  async modifier(id, recette) {
    const recettes = await listerTout();
    const existante = recettes.find((r) => r.id === id);
    if (!existante) return null;

    const misAJour = {
      ...existante,
      categorieId: recette.categorieId,
      nomFr: recette.nomFr,
      emoji: recette.emoji ?? existante.emoji,
      nombrePortions: recette.nombrePortions,
      tempsPreparation: recette.tempsPreparation,
      dateMaj: new Date().toISOString(),
      ingredients: recette.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantite: ing.quantite,
        codeUnite: ing.codeUnite,
        estFacultatif: ing.estFacultatif ?? false
      })),
      etapes: recette.etapes.map((texte, index) => ({ ordre: index + 1, texteFr: texte }))
    };

    await ecrire(CLES.RECETTES, recettes.map((r) => (r.id === id ? misAJour : r)));
    return misAJour;
  },

  async supprimer(id) {
    const recettes = await listerTout();
    await ecrire(CLES.RECETTES, recettes.filter((r) => r.id !== id));
  }
};
