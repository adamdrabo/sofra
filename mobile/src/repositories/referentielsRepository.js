import { CLES, ecrire, genererId, lire } from '../db/storage';
import { normaliserNom } from '../services/normalisation';

export const referentielsRepository = {
  async listerUnites() {
    return lire(CLES.UNITES, []);
  },

  async listerCategories() {
    return lire(CLES.CATEGORIES, []);
  },

  async listerIngredients() {
    const ingredients = await lire(CLES.INGREDIENTS, []);
    return [...ingredients].sort((a, b) => a.nomFr.localeCompare(b.nomFr));
  },

  // C'est ici que vit la règle de normalisation : nomNormalise() décide
  // si "Tomates" correspond à l'ingrédient "Tomate" déjà connu. Le
  // stockage clé-valeur ne vérifie aucune unicité tout seul (document
  // v5), donc cette vérification vit ici, dans le code.
  async trouverOuCreerIngredient(nomFr, codeUniteBase) {
    const ingredients = await lire(CLES.INGREDIENTS, []);
    const nomNormalise = normaliserNom(nomFr);

    const existant = ingredients.find((i) => i.nomNormalise === nomNormalise);
    if (existant) return existant;

    const nouveau = {
      id: genererId(),
      nomFr,
      nomEn: nomFr,
      nomAr: nomFr,
      nomNormalise,
      codeUniteBase,
      provenance: 'UTILISATEUR',
      dateCreation: new Date().toISOString()
    };
    await ecrire(CLES.INGREDIENTS, [...ingredients, nouveau]);
    return nouveau;
  }
};
