import { CLES, ecrire, lire } from '../db/storage';

const PAR_DEFAUT = {
  id: 1,
  nombrePersonnes: 2,
  carte: 'EQUILIBRE',
  langue: 'fr',
  deviseCode: 'CAD',
  onboardingTermine: false,
  dateMaj: new Date().toISOString()
};

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
