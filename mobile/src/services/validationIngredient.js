const CARACTERES_PERMIS = /^[\p{L}\s'’-]+$/u;

const LONGUEUR_MIN = 2;
const LONGUEUR_MAX = 40;

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

export function nettoyerNomIngredient(saisie) {
  const nom = (saisie ?? '').trim().replace(/\s+/g, ' ');
  if (nom.length === 0) return nom;
  return nom[0].toUpperCase() + nom.slice(1);
}