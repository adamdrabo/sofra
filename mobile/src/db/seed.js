import { CLES, ecrire, lire } from './storage';

// Donnees livrees avec l'application, ecrites a la premiere ouverture
// (provenance SEED). A appeler une fois au demarrage (voir App.js). Ne
// fait rien si le stockage a deja ete ensemence.
export async function ensemencerSiVide() {
  const uniteExistantes = await lire(CLES.UNITES, null);
  if (uniteExistantes) return;

  const maintenant = new Date().toISOString();

  const unites = [
    { code: 'g', type: 'MASSE', codeUniteBase: 'g', facteurVersBase: 1, nomFr: 'gramme', nomEn: 'gram', nomAr: 'غرام' },
    { code: 'kg', type: 'MASSE', codeUniteBase: 'g', facteurVersBase: 1000, nomFr: 'kilogramme', nomEn: 'kilogram', nomAr: 'كيلوغرام' },
    { code: 'ml', type: 'VOLUME', codeUniteBase: 'ml', facteurVersBase: 1, nomFr: 'millilitre', nomEn: 'milliliter', nomAr: 'مليلتر' },
    { code: 'l', type: 'VOLUME', codeUniteBase: 'ml', facteurVersBase: 1000, nomFr: 'litre', nomEn: 'liter', nomAr: 'لتر' },
    { code: 'tasse', type: 'VOLUME', codeUniteBase: 'ml', facteurVersBase: 250, nomFr: 'tasse', nomEn: 'cup', nomAr: 'كوب' },
    { code: 'piece', type: 'PIECE', codeUniteBase: 'piece', facteurVersBase: 1, nomFr: 'pièce', nomEn: 'piece', nomAr: 'قطعة' }
  ];

  const categories = [
    { id: 1, nomFr: 'Petit-déjeuner', nomEn: 'Breakfast', nomAr: 'فطور', emoji: '🥐' },
    { id: 2, nomFr: 'Plat principal', nomEn: 'Main dish', nomAr: 'طبق رئيسي', emoji: '🍲' },
    { id: 3, nomFr: 'Accompagnement', nomEn: 'Side dish', nomAr: 'طبق جانبي', emoji: '🥗' },
    { id: 4, nomFr: 'Dessert', nomEn: 'Dessert', nomAr: 'حلوى', emoji: '🍰' }
  ];

  const ingredients = [
    { id: 1, nomFr: 'Bœuf en cubes', nomEn: 'Beef cubes', nomAr: 'لحم بقر مكعبات', nomNormalise: 'boeuf en cubes', codeUniteBase: 'g', provenance: 'SEED', dateCreation: maintenant },
    { id: 2, nomFr: 'Oignon', nomEn: 'Onion', nomAr: 'بصل', nomNormalise: 'oignon', codeUniteBase: 'piece', provenance: 'SEED', dateCreation: maintenant },
    { id: 3, nomFr: 'Tomate', nomEn: 'Tomato', nomAr: 'طماطم', nomNormalise: 'tomate', codeUniteBase: 'piece', provenance: 'SEED', dateCreation: maintenant },
    { id: 4, nomFr: 'Riz basmati', nomEn: 'Basmati rice', nomAr: 'أرز بسمتي', nomNormalise: 'riz basmati', codeUniteBase: 'g', provenance: 'SEED', dateCreation: maintenant },
    { id: 5, nomFr: 'Ail', nomEn: 'Garlic', nomAr: 'ثوم', nomNormalise: 'ail', codeUniteBase: 'piece', provenance: 'SEED', dateCreation: maintenant },
    { id: 6, nomFr: 'Pâte de tomate', nomEn: 'Tomato paste', nomAr: 'معجون طماطم', nomNormalise: 'pate de tomate', codeUniteBase: 'ml', provenance: 'SEED', dateCreation: maintenant },
    { id: 7, nomFr: 'Huile d\u2019olive', nomEn: 'Olive oil', nomAr: 'زيت زيتون', nomNormalise: 'huile d\u2019olive', codeUniteBase: 'ml', provenance: 'SEED', dateCreation: maintenant },
    { id: 8, nomFr: 'Poulet', nomEn: 'Chicken', nomAr: 'دجاج', nomNormalise: 'poulet', codeUniteBase: 'g', provenance: 'SEED', dateCreation: maintenant },
    { id: 9, nomFr: 'Carotte', nomEn: 'Carrot', nomAr: 'جزر', nomNormalise: 'carotte', codeUniteBase: 'piece', provenance: 'SEED', dateCreation: maintenant },
    { id: 10, nomFr: 'Sel', nomEn: 'Salt', nomAr: 'ملح', nomNormalise: 'sel', codeUniteBase: 'g', provenance: 'SEED', dateCreation: maintenant }
  ];

  const preference = {
    id: 1,
    nombrePersonnes: 2,
    carte: 'EQUILIBRE',
    langue: 'fr',
    deviseCode: 'CAD',
    dateMaj: maintenant
  };

  // Deux recettes d'exemple pour ne pas ouvrir l'appli sur un ecran
  // vide (provenance SEED, comme les referentiels ci-dessus).
  const recettes = [
    {
      id: 101,
      categorieId: 2,
      recetteParenteId: null,
      origineCommunaute: null,
      nomFr: 'Mafé de bœuf',
      emoji: '🍲',
      nombrePortions: 4,
      tempsPreparation: 45,
      dateCreation: maintenant,
      dateMaj: maintenant,
      ingredients: [
        { ingredientId: 1, quantite: 600, codeUnite: 'g', estFacultatif: false },
        { ingredientId: 2, quantite: 1, codeUnite: 'piece', estFacultatif: false },
        { ingredientId: 6, quantite: 60, codeUnite: 'ml', estFacultatif: false },
        { ingredientId: 4, quantite: 300, codeUnite: 'g', estFacultatif: false }
      ],
      etapes: [
        { ordre: 1, texteFr: 'Faire dorer le bœuf en cubes dans un peu d\u2019huile.' },
        { ordre: 2, texteFr: 'Ajouter l\u2019oignon émincé et cuire 5 minutes.' },
        { ordre: 3, texteFr: 'Incorporer la pâte de tomate et 500 ml d\u2019eau, laisser mijoter 25 minutes.' },
        { ordre: 4, texteFr: 'Servir avec le riz basmati cuit à part.' }
      ]
    },
    {
      id: 102,
      categorieId: 3,
      recetteParenteId: null,
      origineCommunaute: null,
      nomFr: 'Salade de tomates',
      emoji: '🥗',
      nombrePortions: 2,
      tempsPreparation: 10,
      dateCreation: maintenant,
      dateMaj: maintenant,
      ingredients: [
        { ingredientId: 3, quantite: 3, codeUnite: 'piece', estFacultatif: false },
        { ingredientId: 5, quantite: 1, codeUnite: 'piece', estFacultatif: false },
        { ingredientId: 7, quantite: 15, codeUnite: 'ml', estFacultatif: false }
      ],
      etapes: [
        { ordre: 1, texteFr: 'Couper les tomates en quartiers.' },
        { ordre: 2, texteFr: 'Ajouter l\u2019ail émincé et l\u2019huile d\u2019olive, saler.' }
      ]
    }
  ];

  // Plan et liste de courses de demonstration, en attendant que le
  // calcul d'agregation appelle vraiment coursesRepository.creerListe().
  // A retirer une fois cette fonction ecrite.
  const planDemo = {
    id: 501,
    dateDebut: maintenant,
    nombrePersonnes: 2,
    carte: 'EQUILIBRE',
    deviseCode: 'CAD',
    dateCreation: maintenant,
    repas: [
      { id: 5011, recetteId: 101, recetteExterneId: null, jourSemaine: 1, typeRepas: 'DINER', nombrePortions: 2 },
      { id: 5012, recetteId: 102, recetteExterneId: null, jourSemaine: 1, typeRepas: 'DEJEUNER', nombrePortions: 2 }
    ]
  };

  const listeDemo = {
    id: 601,
    planHebdoId: 501,
    dateGeneration: maintenant,
    montantEstime: 12.45,
    montantReel: null,
    recettesNonChiffrees: 0,
    deviseCode: 'CAD',
    lignes: [
      { id: 6011, ingredientId: 1, quantite: 600, codeUnite: 'g', prixUnitaire: 0.007, sourcePrix: 'REFERENCE', sousTotal: 4.2, estAchete: false },
      { id: 6012, ingredientId: 2, quantite: 1, codeUnite: 'piece', prixUnitaire: 0.8, sourcePrix: 'REFERENCE', sousTotal: 0.8, estAchete: false },
      { id: 6013, ingredientId: 6, quantite: 60, codeUnite: 'ml', prixUnitaire: 0.03, sourcePrix: 'REFERENCE', sousTotal: 1.8, estAchete: true },
      { id: 6014, ingredientId: 4, quantite: 300, codeUnite: 'g', prixUnitaire: 0.005, sourcePrix: 'REFERENCE', sousTotal: 1.5, estAchete: false },
      { id: 6015, ingredientId: 3, quantite: 3, codeUnite: 'piece', prixUnitaire: 0.5, sourcePrix: 'REFERENCE', sousTotal: 1.5, estAchete: false },
      { id: 6016, ingredientId: 5, quantite: 1, codeUnite: 'piece', prixUnitaire: 0.65, sourcePrix: 'REFERENCE', sousTotal: 0.65, estAchete: false },
      { id: 6017, ingredientId: 7, quantite: 15, codeUnite: 'ml', prixUnitaire: 0.13, sourcePrix: 'REFERENCE', sousTotal: 2.0, estAchete: false }
    ]
  };

  await ecrire(CLES.UNITES, unites);
  await ecrire(CLES.CATEGORIES, categories);
  await ecrire(CLES.INGREDIENTS, ingredients);
  await ecrire(CLES.PREFERENCE, preference);
  await ecrire(CLES.RECETTES, recettes);
  await ecrire(CLES.RECETTES_EXTERNES, []);
  await ecrire(CLES.FAVORIS, []);
  await ecrire(CLES.PLANS_HEBDO, [planDemo]);
  await ecrire(CLES.PRIX_REFERENCE, []);
  await ecrire(CLES.PRIX_PERSONNALISE, []);
  await ecrire(CLES.LISTES_COURSES, [listeDemo]);
}
