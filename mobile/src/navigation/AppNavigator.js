import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabsNavigator } from './TabsNavigator';
import { EcranConfiguration } from '../screens/EcranConfiguration';
import { EcranFicheRecette } from '../screens/EcranFicheRecette';
import { EcranNouvelleRecette } from '../screens/EcranNouvelleRecette';

const Stack = createNativeStackNavigator();

// Pile principale : les cinq onglets, plus les écrans qui s'ouvrent
// par-dessus (Configuration, Fiche recette, Nouvelle/Modifier recette).
export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Onglets" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Configuration" component={EcranConfiguration} />
      <Stack.Screen name="FicheRecette" component={EcranFicheRecette} options={{ title: 'Recette' }} />
      <Stack.Screen
        name="NouvelleRecette"
        component={EcranNouvelleRecette}
        options={({ route }) => ({
          title: route.params?.id ? 'Modifier la recette' : 'Nouvelle recette',
          presentation: 'modal'
        })}
      />
    </Stack.Navigator>
  );
}
