import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { EcranSemaine } from '../screens/EcranSemaine';
import { EcranRecettes } from '../screens/EcranRecettes';
import { EcranListe } from '../screens/EcranListe';
import { EcranCompte } from '../screens/EcranCompte';
import { couleurs } from '../theme';

const Tab = createBottomTabNavigator();

// Petites icones volontairement simples et originales, dessinees avec des
// vues React Native plutot que les boutons natifs d'iOS/Android.
function IconeOnglet({ nom, actif }) {
  const couleur = actif ? couleurs.primaire : couleurs.encreDouce;

  if (nom === 'semaine') {
    return (
      <View style={styles.icone}>
        <View style={[styles.calendrier, { borderColor: couleur }]}>
          <View style={[styles.calendrierLigne, { backgroundColor: couleur }]} />
          <View style={styles.calendrierCases}>
            {[0, 1, 2].map((i) => <View key={i} style={[styles.point, { backgroundColor: couleur }]} />)}
          </View>
        </View>
      </View>
    );
  }

  if (nom === 'recettes') {
    return (
      <View style={styles.icone}>
        <View style={[styles.livre, { borderColor: couleur }]}>
          <View style={[styles.livreTrait, { backgroundColor: couleur }]} />
          <View style={[styles.livreTraitCourt, { backgroundColor: couleur }]} />
        </View>
      </View>
    );
  }

  if (nom === 'liste') {
    return (
      <View style={styles.icone}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.ligneIcone}>
            <View style={[styles.lignePoint, { backgroundColor: couleur }]} />
            <View style={[styles.ligneTexte, { backgroundColor: couleur }]} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.icone}>
      <View style={[styles.tete, { backgroundColor: couleur }]} />
      <View style={[styles.epaules, { borderColor: couleur }]} />
    </View>
  );
}

export function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: couleurs.primaire,
        tabBarInactiveTintColor: couleurs.encreDouce,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.barre,
        tabBarItemStyle: styles.item,
        tabBarIcon: ({ focused }) => (
          <IconeOnglet
            actif={focused}
            nom={route.name === 'Semaine' ? 'semaine' : route.name === 'Recettes' ? 'recettes' : route.name === 'Liste' ? 'liste' : 'compte'}
          />
        )
      })}
    >
      <Tab.Screen name="Semaine" component={EcranSemaine} />
      <Tab.Screen name="Recettes" component={EcranRecettes} />
      <Tab.Screen name="Liste" component={EcranListe} />
      <Tab.Screen name="Compte" component={EcranCompte} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barre: {
    height: 78,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: couleurs.blanc,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
    elevation: 0,
    shadowOpacity: 0
  },
  item: { paddingHorizontal: 2 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  icone: { width: 26, height: 25, alignItems: 'center', justifyContent: 'center' },
  calendrier: { width: 22, height: 21, borderWidth: 2, borderRadius: 5, overflow: 'hidden' },
  calendrierLigne: { height: 4, width: '100%' },
  calendrierCases: { flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: 5 },
  point: { width: 3, height: 3, borderRadius: 3 },
  livre: { width: 20, height: 22, borderWidth: 2, borderRadius: 3, justifyContent: 'center', paddingHorizontal: 4 },
  livreTrait: { height: 2, width: '100%', marginBottom: 4 },
  livreTraitCourt: { height: 2, width: '65%' },
  ligneIcone: { width: 22, height: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  lignePoint: { width: 4, height: 4, borderRadius: 4 },
  ligneTexte: { height: 2, width: 14, borderRadius: 2 },
  tete: { width: 9, height: 9, borderRadius: 9, position: 'absolute', top: 2 },
  epaules: { width: 20, height: 11, borderWidth: 2, borderBottomWidth: 0, borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'absolute', bottom: 1 }
});
