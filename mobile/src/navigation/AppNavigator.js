import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabsNavigator } from './TabsNavigator';
import { EcranConfiguration } from '../screens/EcranConfiguration';
import { EcranFicheRecette } from '../screens/EcranFicheRecette';
import { EcranNouvelleRecette } from '../screens/EcranNouvelleRecette';
import { EcranOnboardingPersonnes } from '../screens/EcranOnboardingPersonnes';
import { EcranOnboardingCarte } from '../screens/EcranOnboardingCarte';
import { EcranOnboardingLangue } from '../screens/EcranOnboardingLangue';

const Stack = createNativeStackNavigator();

// Les ecrans secondaires utilisent maintenant leur propre en-tete Sofra.
// On masque donc completement l'en-tete natif iOS/Android.
// ecranInitial : 'OnboardingPersonnes' au premier lancement, 'Onglets' ensuite.
export function AppNavigator({ ecranInitial = 'Onglets' }) {
  return (
    <Stack.Navigator initialRouteName={ecranInitial} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingPersonnes" component={EcranOnboardingPersonnes} />
      <Stack.Screen name="OnboardingCarte" component={EcranOnboardingCarte} />
      <Stack.Screen name="OnboardingLangue" component={EcranOnboardingLangue} />
      <Stack.Screen name="Onglets" component={TabsNavigator} />
      <Stack.Screen name="Configuration" component={EcranConfiguration} />
      <Stack.Screen name="FicheRecette" component={EcranFicheRecette} />
      <Stack.Screen name="NouvelleRecette" component={EcranNouvelleRecette} />
    </Stack.Navigator>
  );
}