import { clientSofra } from './clientSofra';
import { nettoyerNomIngredient } from './validationIngredient';
import { recetteRepository } from '../repositories/recetteRepository';
import { referentielsRepository } from '../repositories/referentielsRepository';

// Les deux sens de l'echange avec le fil de la communaute.
//
// POURQUOI UN SERVICE ET PAS DU CODE DANS LES ECRANS
// Les deux operations sont des traductions entre deux formes de
// recette qui n'ont rien a voir :
//
//   en local  : ingredients normalises, relies au referentiel par un id
//   au serveur : ingredients en texte libre, imbriques dans la recette
//
// Le serveur ne calcule aucun cout, il n'a donc pas besoin du
// referentiel d'unites (document v5, paquet Communaute). La
// normalisation se refait sur l'appareil de celui qui adapte la
// recette, et c'est exactement ce que fait adapterRecettePubliee.

// --- Publier : local vers serveur ---------------------------------

// Une recette publiee est une COPIE FIGEE : si l'auteur modifie ou
// supprime la sienne ensuite, le fil ne bouge pas.
export async function publierRecetteLocale(recetteId) {
  const [recette, ingredients, categories] = await Promise.all([
    recetteRepository.obtenirParId(recetteId),
    referentielsRepository.listerIngredients(),
    referentielsRepository.listerCategories()
  ]);

  if (!recette) throw new Error('Recette introuvable.');

  const nomCategorie = categories.find((c) => c.id === recette.categorieId)?.nomFr ?? null;

  const corps = {
    // Le titre existe en trois langues cote serveur ; l'application ne
    // gere que le francais pour l'instant, on ne remplit que celui-la.
    titre: { fr: recette.nomFr },
    categorie: nomCategorie,
    nombrePortions: recette.nombrePortions,
    tempsPreparation: recette.tempsPreparation,
    ingredients: recette.ingredients.map((ing) => ({
      // Le nom est resolu ici : le serveur ne connait pas nos ids.
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

// --- Adapter : serveur vers local ---------------------------------

function titreAffiche(publiee) {
  return publiee.titre?.fr || publiee.titre?.en || publiee.titre?.ar || 'Recette de la communauté';
}

// L'unite arrive en texte libre : elle vient de l'appareil de quelqu'un
// d'autre, qui peut avoir ecrit "kg", "Kg" ou autre chose. On cherche
// une unite connue ; a defaut, la piece, qui ne convertit rien et ne
// fausse donc aucun calcul.
function trouverUnite(unites, texte) {
  const cherche = String(texte ?? '').trim().toLowerCase();
  return unites.find((u) => u.code.toLowerCase() === cherche) ?? unites.find((u) => u.code === 'piece') ?? unites[0];
}

/**
 * Copie une recette publiee dans les recettes de la personne.
 * Chaque ingredient passe par la normalisation : "Tomates" retrouve
 * l'ingredient "Tomate" deja connu plutot que d'en creer un doublon.
 *
 * La copie porte origineCommunaute (l'id de la recette publiee), ce qui
 * garde la trace de sa provenance sans creer de lien vivant : la copie
 * est independante une fois faite.
 */
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
      // Une quantite absente ou illisible vaut 1 : mieux vaut une ligne
      // a corriger qu'une recette qui refuse de s'enregistrer.
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