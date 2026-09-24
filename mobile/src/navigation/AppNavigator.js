import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabsNavigator } from './TabsNavigator';
import { EcranConfiguration } from '../screens/EcranConfiguration';
import { EcranFicheRecette } from '../screens/EcranFicheRecette';
import { EcranFicheRecetteExterne } from '../screens/EcranFicheRecetteExterne';
import { EcranNouvelleRecette } from '../screens/EcranNouvelleRecette';
import { EcranChoisirRecette } from '../screens/EcranChoisirRecette';

const Stack = createNativeStackNavigator();

// Les ecrans secondaires utilisent maintenant leur propre en-tete Sofra.
// On masque donc completement l'en-tete natif iOS/Android.
//
// Deux fiches distinctes, parce que les deux sources de recettes n'ont
// rien a voir : "FicheRecette" lit le stockage local, "FicheRecetteExterne"
// demande le detail au serveur a chaque ouverture et ne garde rien.
export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onglets" component={TabsNavigator} />
      <Stack.Screen name="Configuration" component={EcranConfiguration} />
      <Stack.Screen name="FicheRecette" component={EcranFicheRecette} />
      <Stack.Screen name="FicheRecetteExterne" component={EcranFicheRecetteExterne} />
      <Stack.Screen name="NouvelleRecette" component={EcranNouvelleRecette} />
      <Stack.Screen name="ChoisirRecette" component={EcranChoisirRecette} />
    </Stack.Navigator>
  );
}
