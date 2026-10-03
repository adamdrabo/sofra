import * as SecureStore from 'expo-secure-store';

const CLE_JETON = 'sofra.jeton';
const CLE_COMPTE = 'sofra.compte';

export const sessionService = {
  async enregistrer(jeton, compte) {
    await SecureStore.setItemAsync(CLE_JETON, jeton);
    await SecureStore.setItemAsync(CLE_COMPTE, JSON.stringify(compte));
  },

  async obtenirJeton() {
    return SecureStore.getItemAsync(CLE_JETON);
  },

  async obtenirCompte() {
    const brut = await SecureStore.getItemAsync(CLE_COMPTE);
    return brut ? JSON.parse(brut) : null;
  },

  async deconnecter() {
    await SecureStore.deleteItemAsync(CLE_JETON);
    await SecureStore.deleteItemAsync(CLE_COMPTE);
  },

  async estConnecte() {
    return (await sessionService.obtenirJeton()) !== null;
  }
};
