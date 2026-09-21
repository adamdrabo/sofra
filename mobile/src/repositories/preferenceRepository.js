import { CLES, ecrire, lire } from '../db/storage';

const PAR_DEFAUT = {
  id: 1,
  nombrePersonnes: 2,
  carte: 'EQUILIBRE',
  langue: 'fr',
  deviseCode: 'CAD',
  dateMaj: new Date().toISOString()
};

// Un seul jeu de préférences par appareil (voir "Un seul profil par
// appareil" dans le document v5) : pas de tableau, un objet unique.
export const preferenceRepository = {
  async obtenir() {
    return lire(CLES.PREFERENCE, PAR_DEFAUT);
  },

  async mettreAJour(champs) {
    const actuelle = await preferenceRepository.obtenir();
    const fusion = { ...actuelle, ...champs, dateMaj: new Date().toISOString() };
    await ecrire(CLES.PREFERENCE, fusion);
    return fusion;
  }
};
