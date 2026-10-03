import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HAUTEUR_BARRE_ONGLETS, MARGE_BARRE_ONGLETS } from '../constants/barreOnglets';

export function useEspacementBarreOnglets(respiration = 12) {
  const insets = useSafeAreaInsets();
  return insets.bottom + MARGE_BARRE_ONGLETS + HAUTEUR_BARRE_ONGLETS + respiration;
}