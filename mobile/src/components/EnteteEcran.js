import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { couleurs, espacement, rayon } from '../theme';

// En-tete commun de Sofra : toujours sous la barre d'etat, avec un titre
// coherent et, si necessaire, un bouton retour/action personnalise.
export function EnteteEcran({ titre, sousTitre, onRetour, action }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.conteneur, { paddingTop: Math.max(insets.top, 10) + 8 }]}>
      <View style={styles.ligne}>
        {onRetour ? (
          <Pressable
            onPress={onRetour}
            accessibilityRole="button"
            accessibilityLabel="Retour"
            style={({ pressed }) => [styles.boutonRetour, pressed && styles.presse]}
          >
            <Text style={styles.fleche}>‹</Text>
          </Pressable>
        ) : null}

        <View style={styles.titres}>
          <Text style={styles.titre}>{titre}</Text>
          {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
        </View>

        {action ? (
          <Pressable
            onPress={action.onPress}
            accessibilityRole="button"
            style={({ pressed }) => [styles.action, pressed && styles.presse]}
          >
            <Text style={styles.actionTexte}>{action.texte}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    paddingHorizontal: espacement.md,
    paddingBottom: 14,
    backgroundColor: couleurs.fondEcran
  },
  ligne: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  titres: { flex: 1, gap: 3 },
  titre: { fontSize: 26, fontWeight: '700', color: couleurs.encre },
  sousTitre: { fontSize: 14, color: couleurs.encreDouce },
  boutonRetour: {
    width: 42,
    height: 42,
    borderRadius: rayon.pastille,
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fleche: {
    fontSize: 32,
    lineHeight: 34,
    color: couleurs.encre,
    marginTop: -2
  },
  action: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: rayon.pastille,
    backgroundColor: couleurs.fondDegrade,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTexte: { fontSize: 13, fontWeight: '700', color: couleurs.primaireFonce },
  presse: { opacity: 0.7, transform: [{ scale: 0.98 }] }
});
