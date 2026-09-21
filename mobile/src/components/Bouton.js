import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { couleurs, rayon } from '../theme';

// Reprend les deux styles de bouton vus partout dans le prototype :
// plein (fond primaire, texte blanc) et contour (bordure primaire).
export function Bouton({ titre, onPress, variante = 'plein', enChargement, desactive }) {
  const estPlein = variante === 'plein';
  return (
    <Pressable
      onPress={onPress}
      disabled={desactive || enChargement}
      style={[
        styles.base,
        estPlein ? styles.plein : styles.contour,
        (desactive || enChargement) && styles.desactive
      ]}
    >
      {enChargement ? (
        <ActivityIndicator color={estPlein ? couleurs.blanc : couleurs.primaire} />
      ) : (
        <Text style={[styles.texte, estPlein ? styles.textePlein : styles.texteContour]}>{titre}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: rayon.bouton,
    alignItems: 'center',
    justifyContent: 'center'
  },
  plein: { backgroundColor: couleurs.primaire },
  contour: { backgroundColor: couleurs.blanc, borderWidth: 1, borderColor: couleurs.primaire },
  desactive: { opacity: 0.5 },
  texte: { fontSize: 16, fontWeight: '600' },
  textePlein: { color: couleurs.blanc },
  texteContour: { color: couleurs.primaire }
});
