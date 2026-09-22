/**
 * FICHIER AJOUTE (absent de la structure de depart)
 *
 * POURQUOI CE FICHIER
 * Composant "Filtre d'exclusion" du C4 niveau 3 serveur. C'est lui qui porte la promesse
 * centrale de Sofra : aucune recette avec porc ou alcool. Il merite son propre fichier
 * plutot que d'etre noye dans la passerelle, pour qu'on puisse le montrer et le tester seul.
 *
 * CONTEXTE, DEUX NIVEAUX DE PROTECTION
 * 1. Avant l'appel : les termes actifs deviennent le parametre excludeIngredients.
 * 2. Apres l'appel : on reverifie les titres (plan) et les ingredients (detail) avec les
 *    memes termes. Raison : le filtre Spoonacular est lexical et laisse passer des cas
 *    (mesure du 11 septembre : une recette au prosciutto est sortie malgre le filtre).
 *
 * REGLE DE SECURITE
 * Si la liste est vide (seed oublie, base vide), on REFUSE de generer un plan.
 * Un plan non filtre serait pire qu'une erreur pour les personnes qui utilisent l'app.
 */
const TermeExclu = require('../models/TermeExclu');
const { ErreurApi } = require('../middleware/errorHandler');

async function obtenirTermesActifs() {
  const docs = await TermeExclu.find({ estActif: true }).select('terme -_id').lean();
  const termes = docs.map((d) => d.terme);
  if (termes.length === 0) {
    throw new ErreurApi(
      503,
      'FILTRE_INDISPONIBLE',
      'Le filtre d\'exclusion est vide. Lancer "npm run seed" sur le serveur.'
    );
  }
  return termes;
}

function construireExcludeIngredients(termes) {
  return termes.join(',');
}

// Echappe les caracteres speciaux d'expression reguliere (un terme comme "rum (dark)" casserait la regex).
function echapper(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Renvoie les termes trouves dans le texte. Recherche par mot entier et au pluriel simple :
// "ham" doit attraper "ham" et "hams", mais pas "graham" ni "shampoo".
function termesPresents(texte, termes) {
  if (!texte) return [];
  const bas = texte.toLowerCase();
  return termes.filter((t) => new RegExp(`\\b${echapper(t)}s?\\b`, 'i').test(bas));
}

module.exports = { obtenirTermesActifs, construireExcludeIngredients, termesPresents };
