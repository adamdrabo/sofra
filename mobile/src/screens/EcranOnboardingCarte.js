import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnteteOnboarding } from '../components/EnteteOnboarding';
import { OptionCarte } from '../components/OptionCarte';
import { Bouton } from '../components/Bouton';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { couleurs, espacement } from '../theme';

const CARTES = [
  { id: 'EQUILIBRE', titre: 'Équilibré', description: 'Un peu de tout, sans excès' },
  { id: 'RAPIDE', titre: 'Rapide à cuisiner', description: 'Moins de 30 minutes par repas' },
  { id: 'PROTEINES', titre: 'Riche en protéines', description: 'Viandes, poissons, légumineuses' }
];

export function EcranOnboardingCarte({ navigation }) {
  const [carte, setCarte] = useState('EQUILIBRE');

  useEffect(() => {
    preferenceRepository.obtenir().then((p) => setCarte(p.carte));
  }, []);

  async function continuer() {
    await preferenceRepository.mettreAJour({ carte });
    navigation.navigate('OnboardingLangue');
  }

  return (
    <SafeAreaView style={styles.ecran}>
      <EnteteOnboarding
        etape={2}
        titre="Quelle carte pour votre semaine ?"
        sousTitre="Une seule carte à la fois. Vous pourrez changer chaque semaine."
      />

      <View style={styles.liste}>
        {CARTES.map((c) => (
          <OptionCarte
            key={c.id}
            titre={c.titre}
            description={c.description}
            active={carte === c.id}
            onPress={() => setCarte(c.id)}
          />
        ))}
      </View>

      <View style={styles.bas}>
        <Bouton titre="Continuer" onPress={continuer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran, padding: espacement.lg },
  liste: { gap: espacement.md, marginTop: espacement.xl },
  bas: { marginTop: 'auto' }
});