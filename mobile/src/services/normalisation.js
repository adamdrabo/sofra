// Normalisation volontairement pauvre : minuscules, accents, espaces.
// Pas de traitement du pluriel (sinon "ananas" deviendrait "anana").
export function normaliserNom(nom) {
  return nom
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/\s+/g, ' ');
}
