import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnteteOnboarding } from '../components/EnteteOnboarding';
import { Bouton } from '../components/Bouton';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { couleurs, espacement } from '../theme';

// 5 s'affiche "5+"
const OPTIONS = [1, 2, 3, 4, 5];

// Onboarding 1/3 : pour combien de personnes cuisine-t-on ?
export function EcranOnboardingPersonnes({ navigation }) {
  const [nombre, setNombre] = useState(2);

  useEffect(() => {
    preferenceRepository.obtenir().then((p) => setNombre(Math.min(p.nombrePersonnes, 5)));
  }, []);

  async function continuer() {
    await preferenceRepository.mettreAJour({ nombrePersonnes: nombre });
    navigation.navigate('OnboardingCarte');
  }

  return (
    <SafeAreaView style={styles.ecran}>
      <EnteteOnboarding
        etape={1}
        titre="Pour combien de personnes cuisinez-vous ?"
        sousTitre="Le plan et la liste d'épicerie s'ajustent. Modifiable à tout moment."
      />

      <View style={styles.ligne}>
        {OPTIONS.map((n) => {
          const actif = n === nombre;
          return (
            <Pressable
              key={n}
              onPress={() => setNombre(n)}
              accessibilityRole="radio"
              accessibilityState={{ selected: actif }}
              style={[styles.rond, actif && styles.rondActif]}
            >
              <Text style={[styles.rondTexte, actif && styles.rondTexteActif]}>
                {n === 5 ? '5+' : n}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bas}>
        <Bouton titre="Continuer" onPress={continuer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran, padding: espacement.lg },
  ligne: { flexDirection: 'row', gap: espacement.sm, marginTop: espacement.xl },
  rond: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rondActif: { backgroundColor: couleurs.primaire, borderColor: couleurs.primaire },
  rondTexte: { fontSize: 18, fontWeight: '700', color: couleurs.encre },
  rondTexteActif: { color: couleurs.blanc },
  bas: { marginTop: 'auto' }
});