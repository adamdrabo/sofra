import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensemencerSiVide } from './src/db/seed';
import { preferenceRepository } from './src/repositories/preferenceRepository';
import { AppNavigator } from './src/navigation/AppNavigator';
import { couleurs } from './src/theme';

const LOGO = require('./assets/sofra-logo.png');
const DUREE_SPLASH = 3000;

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function EcranOuverture() {
  return (
    <View style={styles.splash}>
      <StatusBar style="dark" backgroundColor={couleurs.fondEcran} />
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

export default function App() {
  const [ecranInitial, setEcranInitial] = useState(null);

  useEffect(() => {
    Promise.all([
      ensemencerSiVide().then(() => preferenceRepository.obtenir()),
      attendre(DUREE_SPLASH),
    ]).then(([preference]) => {
      setEcranInitial(preference.onboardingTermine ? 'Onglets' : 'OnboardingPersonnes');
    });
  }, []);

  if (!ecranInitial) {
    return <EcranOuverture />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={couleurs.fondEcran} />
      <NavigationContainer>
        <AppNavigator ecranInitial={ecranInitial} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: couleurs.fondEcran,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '82%',
    height: '32%',
  },
});