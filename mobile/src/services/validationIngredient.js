// Validation du nom d'un ingredient saisi par la personne.
//
// POURQUOI
// Le nom saisi devient une ligne de INGREDIENT avec provenance
// UTILISATEUR : il sert de cle de regroupement dans la liste de courses
// et il portera un prix. Rien ne le supprime ensuite, donc une saisie
// du genre "123" ou "sel!!!" pollue le referentiel pour de bon.
//
// PORTEE
// On verifie la forme, pas le sens : un mot inventé mais ecrit avec des
// lettres passera. Juger qu'un mot designe un aliment demanderait un
// dictionnaire, ce que l'application n'a pas.

// Lettres (accents compris), espace, trait d'union et apostrophe.
// Tout le reste est refuse : chiffres, ponctuation, emoji, symboles.
const CARACTERES_PERMIS = /^[\p{L}\s'’-]+$/u;

const LONGUEUR_MIN = 2;
const LONGUEUR_MAX = 40;

/**
 * Renvoie { valide, message }.
 * message vaut null quand la saisie est acceptable, et aussi quand le
 * champ est encore vide : il n'y a rien a reprocher a qui n'a pas tape.
 */
export function validerNomIngredient(saisie) {
  const nom = (saisie ?? '').trim().replace(/\s+/g, ' ');

  if (nom.length === 0) {
    return { valide: false, message: null };
  }

  if (nom.length < LONGUEUR_MIN) {
    return { valide: false, message: 'Le nom est trop court.' };
  }

  if (nom.length > LONGUEUR_MAX) {
    return { valide: false, message: `Le nom ne peut pas dépasser ${LONGUEUR_MAX} caractères.` };
  }

  if (/\d/.test(nom)) {
    return {
      valide: false,
      message: 'Un nom d’ingrédient ne contient pas de chiffres. Mets la quantité dans le champ prévu.'
    };
  }

  if (!CARACTERES_PERMIS.test(nom)) {
    return { valide: false, message: 'Seules les lettres, l’espace, le trait d’union et l’apostrophe sont permis.' };
  }

  return { valide: true, message: null };
}

// Nettoyage applique avant l'enregistrement : espaces en trop retires,
// premiere lettre en majuscule pour que le referentiel reste lisible
// quelle que soit la facon de taper ("TOMATE", "tomate" -> "Tomate").
export function nettoyerNomIngredient(saisie) {
  const nom = (saisie ?? '').trim().replace(/\s+/g, ' ');
  if (nom.length === 0) return nom;
  return nom[0].toUpperCase() + nom.slice(1);
}