import { clientSofra } from './clientSofra';
import { nettoyerNomIngredient } from './validationIngredient';
import { recetteRepository } from '../repositories/recetteRepository';
import { referentielsRepository } from '../repositories/referentielsRepository';

export async function publierRecetteLocale(recetteId) {
  const [recette, ingredients, categories] = await Promise.all([
    recetteRepository.obtenirParId(recetteId),
    referentielsRepository.listerIngredients(),
    referentielsRepository.listerCategories()
  ]);

  if (!recette) throw new Error('Recette introuvable.');

  const nomCategorie = categories.find((c) => c.id === recette.categorieId)?.nomFr ?? null;

  const corps = {

    titre: { fr: recette.nomFr },
    categorie: nomCategorie,
    nombrePortions: recette.nombrePortions,
    tempsPreparation: recette.tempsPreparation,
    ingredients: recette.ingredients.map((ing) => ({
    
      nom: ingredients.find((i) => i.id === ing.ingredientId)?.nomFr ?? 'Ingrédient',
      quantite: ing.quantite,
      unite: ing.codeUnite
    })),
    etapes: [...recette.etapes]
      .sort((a, b) => a.ordre - b.ordre)
      .map((e) => ({ texte: e.texteFr }))
  };

  const { recette: publiee } = await clientSofra.publierRecette(corps);
  return publiee;
}


function titreAffiche(publiee) {
  return publiee.titre?.fr || publiee.titre?.en || publiee.titre?.ar || 'Recette de la communauté';
}


function trouverUnite(unites, texte) {
  const cherche = String(texte ?? '').trim().toLowerCase();
  return unites.find((u) => u.code.toLowerCase() === cherche) ?? unites.find((u) => u.code === 'piece') ?? unites[0];
}

export async function adapterRecettePubliee(publiee) {
  const [unites, categories] = await Promise.all([
    referentielsRepository.listerUnites(),
    referentielsRepository.listerCategories()
  ]);

  const categorie =
    categories.find((c) => c.nomFr.toLowerCase() === String(publiee.categorie ?? '').toLowerCase()) ?? categories[0];

  const ingredients = [];
  for (const ing of publiee.ingredients ?? []) {
    const unite = trouverUnite(unites, ing.unite);
    const ingredient = await referentielsRepository.trouverOuCreerIngredient(
      nettoyerNomIngredient(ing.nom),
      unite.codeUniteBase
    );
    ingredients.push({
      ingredientId: ingredient.id,
  
      quantite: Number(ing.quantite) > 0 ? Number(ing.quantite) : 1,
      codeUnite: unite.code
    });
  }

  return recetteRepository.creer({
    categorieId: categorie?.id ?? null,
    nomFr: titreAffiche(publiee),
    nombrePortions: publiee.nombrePortions ?? 2,
    tempsPreparation: publiee.tempsPreparation ?? 0,
    origineCommunaute: publiee._id ?? null,
    ingredients,
    etapes: [...(publiee.etapes ?? [])].sort((a, b) => a.ordre - b.ordre).map((e) => e.texte)
  });
}

export { titreAffiche };