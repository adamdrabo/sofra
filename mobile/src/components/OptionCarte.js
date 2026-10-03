import { Pressable, StyleSheet, Text } from 'react-native';
import { couleurs, espacement, rayon } from '../theme';

export function OptionCarte({ titre, description, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.carte,
        active && styles.carteActive,
        pressed && styles.presse
      ]}
    >
      <Text style={[styles.titre, active && styles.texteActif]}>{titre}</Text>
      {description ? (
        <Text style={[styles.description, active && styles.texteActif]}>{description}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.blanc,
    borderRadius: rayon.carteCompacte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: espacement.lg,
    paddingVertical: espacement.lg,
    gap: 4
  },
  carteActive: { backgroundColor: couleurs.primaire, borderColor: couleurs.primaire },
  presse: { opacity: 0.88 },
  titre: { fontSize: 18, fontWeight: '700', color: couleurs.encre },
  description: { fontSize: 14, color: couleurs.encreDouce },
  texteActif: { color: couleurs.blanc }
});