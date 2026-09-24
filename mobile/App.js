import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensemencerSiVide } from './src/db/seed';
import { effacerTout } from './src/db/storage';
import { AppNavigator } from './src/navigation/AppNavigator';
import { couleurs } from './src/theme';

const LOGO = require('./assets/sofra-logo.png');
const DUREE_SPLASH = 3000;

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Écran d'ouverture de Sofra : il reste affiché au minimum 3 secondes.
function EcranOuverture() {
  return (
    <View style={styles.splash}>
      <StatusBar style="dark" backgroundColor={couleurs.fondEcran} />
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

// Point d'entrée de l'application : on initialise le stockage local
// tout en affichant l'écran d'ouverture pendant 3 secondes.
export default function App() {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    Promise.all([
      // TEMPORAIRE : vide le stockage local pour forcer un nouveau seed.
      // A RETIRER apres un seul lancement, sinon l'app oublie tout a
      // chaque ouverture (recettes creees, plan, liste, session).
      effacerTout().then(() => ensemencerSiVide()),
      attendre(DUREE_SPLASH),
    ]).then(() => setPret(true));
  }, []);

  if (!pret) {
    return <EcranOuverture />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={couleurs.fondEcran} />
      <NavigationContainer>
        <AppNavigator />
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