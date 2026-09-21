// Compteur de quota en memoire, remis a zero chaque jour.
// Pour un deploiement multi-instance, remplacer par une collection Mongo ou Redis.
let compteur = 0;
let dateReference = new Date().toDateString();

function verifierEtIncrementer() {
  const aujourdHui = new Date().toDateString();
  if (aujourdHui !== dateReference) {
    compteur = 0;
    dateReference = aujourdHui;
  }
  const limite = Number(process.env.QUOTA_JOURNALIER || 150);
  if (compteur >= limite) {
    const erreur = new Error('Quota Spoonacular atteint pour aujourd\'hui');
    erreur.statut = 429;
    throw erreur;
  }
  compteur += 1;
}

module.exports = { verifierEtIncrementer };
