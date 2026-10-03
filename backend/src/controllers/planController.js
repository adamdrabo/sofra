const spoonacular = require('../services/spoonacularService');
const exclusion = require('../services/exclusionService');
const { ErreurApi } = require('../middleware/errorHandler');

const CARTES = Object.keys(spoonacular.PARAMETRES_PAR_CARTE);
const JOURS = 7;
const MARGE = 1.5;

function completer(liste, n) {
  if (liste.length === 0) return [];
  return Array.from({ length: n }, (_, i) => liste[i % liste.length]);
}

async function genererPlan(req, res) {
  const carte = String(req.query.carte || 'EQUILIBRE').toUpperCase();
  if (!CARTES.includes(carte)) {
    throw new ErreurApi(400, 'CARTE_INVALIDE', `Carte inconnue. Valeurs permises : ${CARTES.join(', ')}.`);
  }

  const termes = await exclusion.obtenirTermesActifs(); // 503 si la liste est vide
  const excludeIngredients = exclusion.construireExcludeIngredients(termes);

  const dejeunersBruts = await spoonacular.rechercherRecettes({
    type: 'breakfast', nombre: Math.ceil(JOURS * MARGE), carte, excludeIngredients,
  });
  const principauxBruts = await spoonacular.rechercherRecettes({
    type: 'main course', nombre: Math.ceil(JOURS * 2 * MARGE), carte, excludeIngredients,
  });

  const sure = (r) => exclusion.termesPresents(r.titre, termes).length === 0;
  const dejeuners = dejeunersBruts.filter(sure);
  const principaux = principauxBruts.filter(sure);

  if (dejeuners.length === 0 && principaux.length === 0) {
    throw new ErreurApi(404, 'AUCUNE_RECETTE', 'Aucune recette ne correspond a cette carte pour le moment.');
  }

  const incomplet = dejeuners.length < JOURS || principaux.length < JOURS * 2;
  const listeDejeuners = completer(dejeuners, JOURS);
  const listePrincipaux = completer(principaux, JOURS * 2);

  const jours = Array.from({ length: JOURS }, (_, i) => ({
    jour: i + 1,
    dejeuner: listeDejeuners[i] ?? null,
    diner: listePrincipaux[i * 2] ?? null,
    souper: listePrincipaux[i * 2 + 1] ?? null,
  }));

  res.json({ carte, genereLe: new Date().toISOString(), incomplet, jours });
}

async function detailRecette(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErreurApi(400, 'IDENTIFIANT_INVALIDE', 'Identifiant de recette invalide.');
  }

  const termes = await exclusion.obtenirTermesActifs();
  const r = await spoonacular.obtenirRecette(id);

  const ingredients = (r.extendedIngredients || []).map((ing) => ({
    nom: ing.name,
    quantite: ing.amount,
    unite: ing.unit,
    texteOriginal: ing.original,
  }));

  const etapes = (r.analyzedInstructions?.[0]?.steps || []).map((e) => ({ ordre: e.number, texte: e.step }));


  const texteAVerifier = [
    r.title,
    ...ingredients.map((i) => `${i.nom} ${i.texteOriginal}`),
    ...etapes.map((e) => e.texte)
  ].join(' | ')
  const alerteExclusion = exclusion.termesPresents(texteAVerifier, termes);

  res.json({
    id: r.id,
    titre: r.title,
    imageUrl: r.image || null,
    tempsPreparation: r.readyInMinutes ?? null,
    nombrePortions: r.servings ?? null,
    ingredients,
    etapes,
    sourceUrl: r.sourceUrl || null, 
    credits: r.creditsText || null, 
    alerteExclusion,
  });
}

module.exports = { genererPlan, detailRecette };
