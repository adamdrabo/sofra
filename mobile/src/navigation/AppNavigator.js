import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabsNavigator } from './TabsNavigator';
import { EcranConfiguration } from '../screens/EcranConfiguration';
import { EcranFicheRecette } from '../screens/EcranFicheRecette';
import { EcranFicheRecetteExterne } from '../screens/EcranFicheRecetteExterne';
import { EcranFicheRecettePubliee } from '../screens/EcranFicheRecettePubliee';
import { EcranNouvelleRecette } from '../screens/EcranNouvelleRecette';
import { EcranChoisirRecette } from '../screens/EcranChoisirRecette';
import { EcranOnboardingPersonnes } from '../screens/EcranOnboardingPersonnes';
import { EcranOnboardingCarte } from '../screens/EcranOnboardingCarte';
import { EcranOnboardingLangue } from '../screens/EcranOnboardingLangue';

const Stack = createNativeStackNavigator();

export function AppNavigator({ ecranInitial = 'Onglets' }) {
  return (
    <Stack.Navigator initialRouteName={ecranInitial} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingPersonnes" component={EcranOnboardingPersonnes} />
      <Stack.Screen name="OnboardingCarte" component={EcranOnboardingCarte} />
      <Stack.Screen name="OnboardingLangue" component={EcranOnboardingLangue} />
      <Stack.Screen name="Onglets" component={TabsNavigator} />
      <Stack.Screen name="Configuration" component={EcranConfiguration} />
      <Stack.Screen name="FicheRecette" component={EcranFicheRecette} />
      <Stack.Screen name="FicheRecetteExterne" component={EcranFicheRecetteExterne} />
      <Stack.Screen name="FicheRecettePubliee" component={EcranFicheRecettePubliee} />
      <Stack.Screen name="NouvelleRecette" component={EcranNouvelleRecette} />
      <Stack.Screen name="ChoisirRecette" component={EcranChoisirRecette} />
    </Stack.Navigator>
  );
}