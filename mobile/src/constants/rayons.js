// Rayons d'epicerie, pour regrouper la liste de courses dans l'ordre
// ou on traverse le magasin plutot que par recette.
//
// POURQUOI ICI ET PAS DANS LE REFERENTIEL
// Le modele v5 ne donne pas de rayon a INGREDIENT. Plutot que de forcer
// une remise a zero du stockage de tout le monde, le rayon est resolu a
// l'affichage : on prend le champ rayon de l'ingredient s'il existe, et
// sinon on le devine a partir de son nom. Le jour ou le champ sera
// ajoute au modele, seule la premiere ligne de rayonPourIngredient
// restera utile.

export const RAYONS = [
  { code: 'FRUITS_LEGUMES', libelle: 'Fruits et légumes', emoji: '🥬', ordre: 1 },
  { code: 'VIANDES', libelle: 'Viandes et volailles', emoji: '🥩', ordre: 2 },
  { code: 'POISSONS', libelle: 'Poissons', emoji: '🐟', ordre: 3 },
  { code: 'CEREALES', libelle: 'Céréales et légumineuses', emoji: '🍚', ordre: 4 },
  { code: 'CREMERIE', libelle: 'Crèmerie et œufs', emoji: '🧀', ordre: 5 },
  { code: 'EPICERIE', libelle: 'Épicerie et conserves', emoji: '🥫', ordre: 6 },
  { code: 'EPICES', libelle: 'Épices et condiments', emoji: '🧂', ordre: 7 },
  { code: 'AUTRES', libelle: 'Autres', emoji: '🧺', ordre: 99 }
];

// Mots-cles par rayon. Volontairement simple : le premier rayon dont un
// mot-cle apparait dans le nom gagne. Un ingredient inconnu tombe dans
// "Autres", ce qui est visible mais jamais bloquant.
const MOTS_CLES = [
  ['FRUITS_LEGUMES', ['tomate', 'oignon', 'ail', 'carotte', 'salade', 'pomme', 'banane', 'poivron', 'courgette', 'patate', 'pomme de terre', 'chou', 'concombre', 'citron', 'persil', 'coriandre', 'menthe', 'gingembre', 'piment', 'aubergine', 'epinard', 'brocoli', 'champignon', 'igname', 'manioc', 'plantain', 'gombo']],
  ['VIANDES', ['boeuf', 'bœuf', 'poulet', 'agneau', 'mouton', 'dinde', 'viande', 'merguez', 'kefta', 'haché', 'hache']],
  ['POISSONS', ['poisson', 'thon', 'saumon', 'tilapia', 'sardine', 'crevette', 'morue']],
  ['CEREALES', ['riz', 'pate', 'pâte alimentaire', 'couscous', 'semoule', 'farine', 'pain', 'lentille', 'pois chiche', 'haricot', 'quinoa', 'boulgour', 'attieke', 'attiéké']],
  ['CREMERIE', ['lait', 'creme', 'crème', 'fromage', 'yaourt', 'yogourt', 'beurre', 'oeuf', 'œuf']],
  ['EPICES', ['sel', 'poivre', 'epice', 'épice', 'cumin', 'paprika', 'curry', 'cube', 'bouillon', 'vinaigre', 'sucre', 'cannelle', 'curcuma', 'gingembre moulu']],
  ['EPICERIE', ['huile', 'conserve', 'tomate en conserve', 'pate de tomate', 'pâte de tomate', 'arachide', 'beurre de cacahuete', 'lait de coco', 'miel', 'confiture', 'the', 'thé', 'cafe', 'café']]
];

// Expressions verifiees AVANT les mots-cles simples : sans elles,
// "pate de tomate" tomberait dans les fruits et legumes a cause du mot
// "tomate", et "lait de coco" dans la cremerie a cause de "lait".
const PHRASES_PRIORITAIRES = [
  ['EPICERIE', ['pate de tomate', 'tomate en conserve', 'lait de coco', 'beurre de cacahuete', 'beurre d’arachide', 'pate d’arachide']],
  ['EPICES', ['sel de mer', 'poivre noir', 'cube de bouillon', 'vinaigre de cidre']]
];

function sansAccents(texte) {
  return (texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Renvoie le code de rayon d'un ingredient du referentiel.
export function rayonPourIngredient(ingredient) {
  if (ingredient?.rayon) return ingredient.rayon;

  const nom = sansAccents(ingredient?.nomNormalise || ingredient?.nomFr);
  if (!nom) return 'AUTRES';

  for (const [code, phrases] of PHRASES_PRIORITAIRES) {
    if (phrases.some((phrase) => nom.includes(sansAccents(phrase)))) return code;
  }

  for (const [code, motsCles] of MOTS_CLES) {
    if (motsCles.some((mot) => nom.includes(sansAccents(mot)))) return code;
  }
  return 'AUTRES';
}

export function rayonParCode(code) {
  return RAYONS.find((r) => r.code === code) ?? RAYONS[RAYONS.length - 1];
}
