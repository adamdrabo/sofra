import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EcranSemaine } from '../screens/EcranSemaine';
import { EcranRecettes } from '../screens/EcranRecettes';
import { EcranListe } from '../screens/EcranListe';
import { EcranFil } from '../screens/EcranFil';
import { EcranCompte } from '../screens/EcranCompte';
import { couleurs } from '../theme';
import { HAUTEUR_BARRE_ONGLETS, MARGE_BARRE_ONGLETS } from '../constants/barreOnglets';

const Tab = createBottomTabNavigator();
const TAILLE_ICONE = 24;

const ICONES_IONICONS = {
  semaine: 'calendar-outline',
  liste: 'list-outline',
  communaute: 'people-outline',
  compte: 'person-outline'
};

function IconeOnglet({ nom, couleur }) {
  if (nom === 'recettes') {
    return <MaterialCommunityIcons name="pot-steam-outline" size={TAILLE_ICONE} color={couleur} />;
  }
  return <Ionicons name={ICONES_IONICONS[nom] ?? 'ellipse-outline'} size={TAILLE_ICONE} color={couleur} />;
}

const NOM_ONGLET_VERS_ICONE = {
  Semaine: 'semaine',
  Recettes: 'recettes',
  Liste: 'liste',
  Communaute: 'communaute',
  Compte: 'compte'
};

export function TabsNavigator() {

  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: couleurs.primaire,
        tabBarInactiveTintColor: couleurs.encreDouce,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,

        tabBarStyle: [styles.barre, { height: HAUTEUR_BARRE_ONGLETS, bottom: insets.bottom + MARGE_BARRE_ONGLETS }],
        tabBarIcon: ({ focused, color }) => (
          <IconeOnglet nom={NOM_ONGLET_VERS_ICONE[route.name] ?? 'compte'} couleur={color} />
        )
      })}
    >
      <Tab.Screen name="Semaine" component={EcranSemaine} />
      <Tab.Screen name="Recettes" component={EcranRecettes} />
      <Tab.Screen name="Liste" component={EcranListe} />
      <Tab.Screen name="Communaute" component={EcranFil} options={{ title: 'Communauté' }} />
      <Tab.Screen name="Compte" component={EcranCompte} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barre: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 24,
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingTop: 8,
    paddingBottom: 8,

    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  item: { paddingHorizontal: 0 },
  label: { fontSize: 10, fontWeight: '600', marginTop: 2 }
});