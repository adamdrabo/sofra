import { StyleSheet, Text, View } from 'react-native';
import { couleurs, espacement } from '../theme';

const TOTAL_ETAPES = 3;

export function EnteteOnboarding({ etape, titre, sousTitre }) {
  const segments = Array.from({ length: TOTAL_ETAPES }, (_, i) => i + 1);

  return (
    <View>
      <View style={styles.progression}>
        {segments.map((n) => (
          <View
            key={n}
            style={[styles.segment, n <= etape ? styles.segmentRempli : styles.segmentVide]}
          />
        ))}
      </View>

      <Text style={styles.etape}>Étape {etape} sur {TOTAL_ETAPES}</Text>
      <Text style={styles.titre}>{titre}</Text>
      {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  progression: { flexDirection: 'row', gap: 6, marginTop: espacement.sm, marginBottom: 40 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  segmentRempli: { backgroundColor: couleurs.primaire },
  segmentVide: { backgroundColor: couleurs.bordure },
  etape: { fontSize: 14, color: couleurs.encreDouce, marginBottom: espacement.xs },
  titre: { fontSize: 30, fontWeight: '800', color: couleurs.encre, lineHeight: 36 },
  sousTitre: { fontSize: 16, color: couleurs.encreDouce, marginTop: espacement.sm, lineHeight: 22 }
});