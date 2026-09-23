import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EnteteEcran } from '../components/EnteteEcran';
import { Bouton } from '../components/Bouton';
import { couleurs, espacement, rayon } from '../theme';
import { planRepository } from '../repositories/planRepository';
import { genererPlanDeLaSemaine } from '../services/planGenerator';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const EMOJIS = ['🍲', '🍗', '🍚', '🥘', '🥗', '🍛', '🍽️'];

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
    return () => { annule = true; };
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

  const repasParJour = useMemo(() => {
    return JOURS.map((nom, index) => ({
      jour: nom,
      numero: index + 1,
      repas: repas.filter((r) => Number(r.jourSemaine) === index + 1)
    }));
  }, [repas]);

  return (
    <View style={styles.ecran}>
      <EnteteEcran
        titre="Ma semaine"
        sousTitre={plan ? 'Ton plan de repas est prêt' : 'Organise tes repas simplement'}
        action={{ texte: '⚙ Préférences', onPress: () => navigation.navigate('Configuration') }}
      />

      {erreur ? <View style={styles.erreur}><Text style={styles.erreurTexte}>{erreur}</Text></View> : null}

      <FlatList
        data={repasParJour}
        keyExtractor={(item) => String(item.numero)}
        contentContainerStyle={styles.liste}
        ListHeaderComponent={(
          <View style={styles.intro}>
            <View>
              <Text style={styles.surTitre}>PLAN DE LA SEMAINE</Text>
              <Text style={styles.grandTexte}>{plan ? 'Voici tes repas' : 'Prêt à planifier ?'}</Text>
            </View>
            <View style={styles.compteur}>
              <Text style={styles.compteurNombre}>{repas.length}</Text>
              <Text style={styles.compteurTexte}>repas</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.carteJour}>
            <View style={styles.jourColonne}>
              <View style={styles.jourBadge}>
                <Text style={styles.jourNumero}>{String(item.numero).padStart(2, '0')}</Text>
              </View>
              <Text style={styles.jourNom}>{item.jour}</Text>
            </View>

            <View style={styles.repasColonne}>
              {item.repas.length === 0 ? (
                <Text style={styles.vide}>Aucun repas prévu</Text>
              ) : item.repas.map((repasDuJour, index) => (
                <View key={String(repasDuJour.id ?? `${item.numero}-${index}`)} style={styles.repasLigne}>
                  <Text style={styles.repasEmoji}>{EMOJIS[index % EMOJIS.length]}</Text>
                  <View style={styles.repasInfos}>
                    <Text style={styles.repasType}>{repasDuJour.typeRepas}</Text>
                    <Text style={styles.repasPortions}>{repasDuJour.nombrePortions} portion(s)</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vide}>Aucun plan pour le moment.</Text>}
      />

      <View style={styles.actionBas}>
        <Bouton
          titre={plan ? 'Regénérer mon plan' : 'Créer mon plan de 7 jours'}
          onPress={genererNouveauPlan}
          enChargement={enChargement}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  liste: { paddingHorizontal: espacement.md, paddingBottom: 110, gap: 12 },
  intro: {
    padding: 18,
    borderRadius: rayon.carte,
    backgroundColor: couleurs.fondDegrade,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  surTitre: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: couleurs.primaireFonce },
  grandTexte: { marginTop: 4, fontSize: 20, fontWeight: '700', color: couleurs.encre },
  compteur: { width: 58, height: 58, borderRadius: 29, backgroundColor: couleurs.blanc, alignItems: 'center', justifyContent: 'center' },
  compteurNombre: { fontSize: 19, fontWeight: '800', color: couleurs.primaire },
  compteurTexte: { fontSize: 10, color: couleurs.encreDouce },
  carteJour: {
    flexDirection: 'row',
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon.carteCompacte,
    padding: 13,
    gap: 12
  },
  jourColonne: { width: 72, alignItems: 'center', justifyContent: 'center', gap: 5 },
  jourBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: couleurs.fondEcran, alignItems: 'center', justifyContent: 'center' },
  jourNumero: { fontSize: 13, fontWeight: '800', color: couleurs.primaire },
  jourNom: { fontSize: 12, fontWeight: '700', color: couleurs.encre },
  repasColonne: { flex: 1, gap: 7, justifyContent: 'center' },
  repasLigne: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  repasEmoji: { fontSize: 24 },
  repasInfos: { flex: 1 },
  repasType: { fontSize: 14, fontWeight: '700', color: couleurs.encre },
  repasPortions: { fontSize: 12, color: couleurs.encreDouce, marginTop: 2 },
  vide: { fontSize: 13, color: couleurs.encreDouce, paddingVertical: 8 },
  actionBas: { position: 'absolute', left: 16, right: 16, bottom: 10 },
  erreur: { marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 12, backgroundColor: '#FBE9E2' },
  erreurTexte: { color: couleurs.primaireFonce, fontSize: 13 }
});
