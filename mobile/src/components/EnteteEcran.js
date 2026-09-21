import { StyleSheet, Text, View } from 'react-native';
import { couleurs } from '../theme';

// En-tete "gros titre + sous-titre gris" repris de tous les ecrans du
// prototype (Ma semaine, Liste d'epicerie, Communaute...).
export function EnteteEcran({ titre, sousTitre }) {
  return (
    <View style={styles.conteneur}>
      <Text style={styles.titre}>{titre}</Text>
      {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { gap: 6, paddingBottom: 18 },
  titre: { fontSize: 26, fontWeight: '600', color: couleurs.encre },
  sousTitre: { fontSize: 14, color: couleurs.encreDouce }
});
