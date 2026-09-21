import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { EcranSemaine } from '../screens/EcranSemaine';
import { EcranRecettes } from '../screens/EcranRecettes';
import { EcranListe } from '../screens/EcranListe';
import { EcranFil } from '../screens/EcranFil';
import { EcranCompte } from '../screens/EcranCompte';
import { couleurs } from '../theme';

const Tab = createBottomTabNavigator();

// Cinq onglets, dans l'ordre du prototype visuel : Semaine, Recettes,
// Liste, Communauté (Fil), Compte.
export function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: couleurs.primaire,
        tabBarInactiveTintColor: couleurs.encreDouce
      }}
    >
      <Tab.Screen name="Semaine" component={EcranSemaine} />
      <Tab.Screen name="Recettes" component={EcranRecettes} />
      <Tab.Screen name="Liste" component={EcranListe} />
      <Tab.Screen name="Communauté" component={EcranFil} />
      <Tab.Screen name="Compte" component={EcranCompte} />
    </Tab.Navigator>
  );
}
