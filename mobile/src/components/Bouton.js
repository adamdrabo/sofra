import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { couleurs, rayon } from '../theme';

export function Bouton({ titre, onPress, variante = 'plein', enChargement, desactive }) {
  const estPlein = variante === 'plein';

  return (
    <Pressable
      onPress={onPress}
      disabled={desactive || enChargement}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        estPlein ? styles.plein : styles.contour,
        (desactive || enChargement) && styles.desactive,
        pressed && !(desactive || enChargement) && styles.presse
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
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: rayon.bouton,
    alignItems: 'center',
    justifyContent: 'center'
  },
  plein: {
    backgroundColor: couleurs.primaire,
    borderWidth: 1,
    borderColor: couleurs.primaireFonce
  },
  contour: {
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.primaire
  },
  desactive: { opacity: 0.5 },
  presse: { transform: [{ scale: 0.985 }], opacity: 0.88 },
  texte: { fontSize: 16, fontWeight: '700' },
  textePlein: { color: couleurs.blanc },
  texteContour: { color: couleurs.primaireFonce }
});
