import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnteteOnboarding } from '../components/EnteteOnboarding';
import { OptionCarte } from '../components/OptionCarte';
import { Bouton } from '../components/Bouton';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { couleurs, espacement } from '../theme';

const LANGUES = [
  { id: 'fr', titre: 'Français' },
  { id: 'en', titre: 'English' },
  { id: 'ar', titre: 'العربية' }
];

// Onboarding 3/3 : langue de l'application. Dernier écran : on marque
// l'accueil comme terminé pour ne plus l'afficher aux prochains lancements.
export function EcranOnboardingLangue({ navigation }) {
  const [langue, setLangue] = useState('fr');
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    preferenceRepository.obtenir().then((p) => setLangue(p.langue));
  }, []);

  async function terminer() {
    setEnregistrement(true);
    await preferenceRepository.mettreAJour({ langue, onboardingTermine: true });
    // reset : on remplace toute la pile pour qu'on ne puisse pas revenir
    // à l'accueil avec le bouton retour.
    navigation.reset({ index: 0, routes: [{ name: 'Onglets' }] });
  }

  return (
    <SafeAreaView style={styles.ecran}>
      <EnteteOnboarding
        etape={3}
        titre="Dans quelle langue ?"
        sousTitre="Sofra existe en français, en anglais et en arabe."
      />

      <View style={styles.liste}>
        {LANGUES.map((l) => (
          <OptionCarte
            key={l.id}
            titre={l.titre}
            active={langue === l.id}
            onPress={() => setLangue(l.id)}
          />
        ))}
      </View>

      <View style={styles.bas}>
        <Bouton titre="Commencer" onPress={terminer} enChargement={enregistrement} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran, padding: espacement.lg },
  liste: { gap: espacement.md, marginTop: espacement.xl },
  bas: { marginTop: 'auto' }
});