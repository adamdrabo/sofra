const BASE_URL = process.env.SPOONACULAR_BASE_URL;
const API_KEY = process.env.SPOONACULAR_API_KEY;

// Traduit une carte (EQUILIBRE, RAPIDE, PROTEINES) en parametres d'appel.
// EQUILIBRE n'ajoute rien, RAPIDE ajoute maxReadyTime, PROTEINES ajoute minProtein.
function parametresPourCarte(carte) {
  switch (carte) {
    case 'RAPIDE':
      return { maxReadyTime: 30 };
    case 'PROTEINES':
      return { minProtein: 25 };
    case 'EQUILIBRE':
    default:
      return {};
  }
}

async function chercherRecettes({ carte, excludeIngredients, nombre = 21 }) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: String(nombre),
    excludeIngredients,
    ...Object.fromEntries(
      Object.entries(parametresPourCarte(carte)).map(([k, v]) => [k, String(v)])
    )
  });

  const reponse = await fetch(`${BASE_URL}/recipes/complexSearch?${params.toString()}`);
  if (!reponse.ok) {
    const erreur = new Error("Echec de l'appel a Spoonacular");
    erreur.statut = reponse.status;
    throw erreur;
  }
  const donnees = await reponse.json();

  // Seuls id, title et image peuvent etre conserves cote client (voir
  // les conditions d'utilisation Spoonacular) : on ne renvoie que ca.
  return donnees.results.map((r) => ({
    cleApiExterne: String(r.id),
    titre: r.title,
    imageUrl: r.image
  }));
}

module.exports = { chercherRecettes };
