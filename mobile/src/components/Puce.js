import { StyleSheet, Text, View } from 'react-native';
import { couleurs, rayon } from '../theme';

export function Puce({ texte, active }) {
  return (
    <View style={[styles.puce, active && styles.puceActive]}>
      <Text style={[styles.texte, active && styles.texteActif]}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  puce: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rayon.pastille,
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure
  },
  puceActive: { backgroundColor: couleurs.primaire, borderColor: couleurs.primaire },
  texte: { fontSize: 13, color: couleurs.encre },
  texteActif: { color: couleurs.blanc, fontWeight: '600' }
});
