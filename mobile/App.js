import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensemencerSiVide } from './src/db/seed';
import { AppNavigator } from './src/navigation/AppNavigator';

// Point d'entree de l'application : on ensemence le stockage local
// (AsyncStorage) avant d'afficher quoi que ce soit d'autre. Ne fait
// rien si l'app a deja ete ouverte une premiere fois.
export default function App() {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    ensemencerSiVide().then(() => setPret(true));
  }, []);

  if (!pret) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
