import { useCallback, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { planRepository } from '../repositories/planRepository';
import { genererPlanDeLaSemaine } from '../services/planGenerator';

// Ecran "Semaine" : affiche le plan courant et permet d'en generer un
// nouveau (cas d'utilisation "Obtenir un plan de 7 jours").
export function EcranSemaine({ navigation }) {
  const [plan, setPlan] = useState(null);
  const [repas, setRepas] = useState([]);
  const [enChargement, setEnChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  const chargerPlanCourant = useCallback(() => {
    let annule = false;
    (async () => {
      const dernierPlan = await planRepository.obtenirDernierPlan();
      if (annule) return;
      setPlan(dernierPlan);
      setRepas(dernierPlan ? await planRepository.listerRepas(dernierPlan.id) : []);
    })();
    return () => {
      annule = true;
    };
  }, []);

  useFocusEffect(chargerPlanCourant);

  async function genererNouveauPlan() {
    setEnChargement(true);
    setErreur(null);
    try {
      await genererPlanDeLaSemaine();
      chargerPlanCourant();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setEnChargement(false);
    }
  }

  return (
    // edges={['top']} evite que le contenu passe sous l'encoche/l'horloge.
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '600' }}>Ma semaine</Text>
        <Button title="Configuration" onPress={() => navigation.navigate('Configuration')} />
      </View>

      {erreur ? <Text style={{ color: 'red', marginBottom: 12 }}>{erreur}</Text> : null}

      <Button
        title={plan ? 'Regenerer le plan' : 'Obtenir mon plan de 7 jours'}
        onPress={genererNouveauPlan}
        disabled={enChargement}
      />
      {enChargement ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}

      <FlatList
        style={{ marginTop: 16 }}
        data={repas}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '600' }}>
              Jour {item.jourSemaine} — {item.typeRepas}
            </Text>
            <Text>{item.nombrePortions} portion(s)</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Aucun plan pour le moment.</Text>}
      />
    </View>
    </SafeAreaView>
  );
}
