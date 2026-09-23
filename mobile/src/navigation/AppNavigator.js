import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabsNavigator } from './TabsNavigator';
import { EcranConfiguration } from '../screens/EcranConfiguration';
import { EcranFicheRecette } from '../screens/EcranFicheRecette';
import { EcranNouvelleRecette } from '../screens/EcranNouvelleRecette';

const Stack = createNativeStackNavigator();

// Les ecrans secondaires utilisent maintenant leur propre en-tete Sofra.
// On masque donc completement l'en-tete natif iOS/Android.
export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onglets" component={TabsNavigator} />
      <Stack.Screen name="Configuration" component={EcranConfiguration} />
      <Stack.Screen name="FicheRecette" component={EcranFicheRecette} />
      <Stack.Screen name="NouvelleRecette" component={EcranNouvelleRecette} />
    </Stack.Navigator>
  );
}
