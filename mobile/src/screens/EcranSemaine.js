import { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EnteteEcran } from '../components/EnteteEcran';
import { Bouton } from '../components/Bouton';
import { couleurs, espacement, rayon } from '../theme';
import { planRepository } from '../repositories/planRepository';
import { recetteExterneRepository } from '../repositories/recetteExterneRepository';
import { recetteRepository } from '../repositories/recetteRepository';
import { genererPlanDeLaSemaine } from '../services/planGenerator';
import { useEspacementBarreOnglets } from '../hooks/useEspacementBarreOnglets';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const REPAS = {
  DEJEUNER: { libelle: 'Déjeuner', emoji: '🥣', rang: 1 },
  DINER: { libelle: 'Dîner', emoji: '🍲', rang: 2 },
  SOUPER: { libelle: 'Souper', emoji: '🍽️', rang: 3 }
};

export function EcranSemaine({ navigation }) {

  const espacementBarre = useEspacementBarreOnglets();
  const [plan, setPlan] = useState(null);
  const [repas, setRepas] = useState([]);
  
  const [recettesExternes, setRecettesExternes] = useState([]);
  const [recettesLocales, setRecettesLocales] = useState([]);
  const [enChargement, setEnChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [incomplet, setIncomplet] = useState(false);

  const chargerPlanCourant = useCallback(() => {
    let annule = false;
    (async () => {
      const dernierPlan = await planRepository.obtenirDernierPlan();
      if (annule) return;
      const [listeRepas, externes, locales] = await Promise.all([
        dernierPlan ? planRepository.listerRepas(dernierPlan.id) : [],
        recetteExterneRepository.lister(),
        recetteRepository.lister()
      ]);
      if (annule) return;
      setPlan(dernierPlan);
      setRepas(listeRepas);
      setRecettesExternes(externes);
      setRecettesLocales(locales);
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
      const resultat = await genererPlanDeLaSemaine();
      setIncomplet(Boolean(resultat?.incomplet));
      chargerPlanCourant();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setEnChargement(false);
    }
  }


  const decrire = useCallback(
    (repasDuJour) => {
      if (repasDuJour.recetteExterneId) {
        const r = recettesExternes.find((x) => x.id === repasDuJour.recetteExterneId);
        return r ? { titre: r.titre, imageUrl: r.imageUrl, externe: r } : null;
      }
      const r = recettesLocales.find((x) => x.id === repasDuJour.recetteId);
      return r ? { titre: r.nomFr, emoji: r.emoji, locale: r } : null;
    },
    [recettesExternes, recettesLocales]
  );

  function remplacerRepas(repasDuJour) {
    if (!plan) return;
    navigation.navigate('ChoisirRecette', {
      planHebdoId: plan.id,
      repasId: repasDuJour.id,
      libelleRepas: REPAS[repasDuJour.typeRepas]?.libelle
    });
  }

  function ouvrirRecette(repasDuJour) {
    const details = decrire(repasDuJour);
    if (!details) return;
    if (details.externe) {
      navigation.navigate('FicheRecetteExterne', {
        idExterne: details.externe.cleApiExterne,
        titre: details.externe.titre
      });
    } else {
      navigation.navigate('FicheRecette', { id: details.locale.id });
    }
  }

  const repasParJour = useMemo(() => {
    return JOURS.map((nom, index) => ({
      jour: nom,
      numero: index + 1,
      repas: repas
        .filter((r) => Number(r.jourSemaine) === index + 1)
        .sort((a, b) => (REPAS[a.typeRepas]?.rang ?? 9) - (REPAS[b.typeRepas]?.rang ?? 9))
    }));
  }, [repas]);

  return (
    <View style={styles.ecran}>
      <EnteteEcran
        titre="Ma semaine"
        sousTitre={plan ? 'Ton plan de repas est prêt' : 'Organise tes repas simplement'}
        action={{ texte: '⚙ Préférences', onPress: () => navigation.navigate('Configuration') }}
      />

      {erreur ? (
        <View style={styles.erreur}>
          <Text style={styles.erreurTexte}>{erreur}</Text>
        </View>
      ) : null}

      {incomplet ? (
        <View style={styles.avis}>
          <Text style={styles.avisTexte}>
            Peu de recettes disponibles pour cette carte : certaines se répètent dans la semaine.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={repasParJour}
        keyExtractor={(item) => String(item.numero)}
        contentContainerStyle={[styles.liste, { paddingBottom: espacementBarre + 70 }]}
        ListHeaderComponent={
          <View style={styles.intro}>
            <View>
              <Text style={styles.surTitre}>PLAN DE LA SEMAINE</Text>
              <Text style={styles.grandTexte}>{plan ? 'Voici tes repas' : 'Prêt à planifier ?'}</Text>
              {plan ? <Text style={styles.astuce}>Appui long sur un repas pour mettre une de tes recettes</Text> : null}
            </View>
            <View style={styles.compteur}>
              <Text style={styles.compteurNombre}>{repas.length}</Text>
              <Text style={styles.compteurTexte}>repas</Text>
            </View>
          </View>
        }
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
              ) : (
                item.repas.map((repasDuJour, index) => {
                  const details = decrire(repasDuJour);
                  const typeRepas = REPAS[repasDuJour.typeRepas];
                  return (
                    <Pressable
                      key={String(repasDuJour.id ?? `${item.numero}-${index}`)}
                      onPress={() => ouvrirRecette(repasDuJour)}
                      onLongPress={() => remplacerRepas(repasDuJour)}
                      delayLongPress={350}
                      // Sans recette retrouvee, il n'y a rien a ouvrir.
                      disabled={!details}
                      style={({ pressed }) => [styles.repasLigne, pressed && styles.repasLignePressee]}
                    >
                      {details?.imageUrl ? (
                        <Image source={{ uri: details.imageUrl }} style={styles.vignette} />
                      ) : (
                        <Text style={styles.repasEmoji}>{details?.emoji ?? typeRepas?.emoji ?? '🍽️'}</Text>
                      )}
                      <View style={styles.repasInfos}>
                        <Text style={styles.repasTitre} numberOfLines={2}>
                          {details?.titre ?? 'Recette indisponible'}
                        </Text>
                        <Text style={styles.repasType}>
                          {typeRepas?.libelle ?? repasDuJour.typeRepas} · {repasDuJour.nombrePortions} portion(s)
                        </Text>
                      </View>
                      {details ? <Text style={styles.chevron}>›</Text> : null}
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vide}>Aucun plan pour le moment.</Text>}
      />

      <View style={[styles.actionBas, { bottom: espacementBarre }]}>
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
  astuce: { marginTop: 6, fontSize: 11, color: couleurs.encreDouce, maxWidth: 200 },
  grandTexte: { marginTop: 4, fontSize: 20, fontWeight: '700', color: couleurs.encre },
  compteur: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center'
  },
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
  jourBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: couleurs.fondEcran,
    alignItems: 'center',
    justifyContent: 'center'
  },
  jourNumero: { fontSize: 13, fontWeight: '800', color: couleurs.primaire },
  jourNom: { fontSize: 12, fontWeight: '700', color: couleurs.encre },
  repasColonne: { flex: 1, gap: 7, justifyContent: 'center' },
  repasLigne: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  repasLignePressee: { opacity: 0.6 },
  vignette: { width: 42, height: 42, borderRadius: 10, backgroundColor: couleurs.placeholderPhoto },
  repasEmoji: { fontSize: 24, width: 42, textAlign: 'center' },
  repasInfos: { flex: 1 },
  repasTitre: { fontSize: 14, fontWeight: '700', color: couleurs.encre },
  repasType: { fontSize: 12, color: couleurs.encreDouce, marginTop: 2 },
  chevron: { fontSize: 22, color: couleurs.encreDouce, paddingHorizontal: 4 },
  vide: { fontSize: 13, color: couleurs.encreDouce, paddingVertical: 8 },

  actionBas: { position: 'absolute', left: 16, right: 16 },
  erreur: { marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 12, backgroundColor: '#FBE9E2' },
  erreurTexte: { color: couleurs.primaireFonce, fontSize: 13 },
  avis: { marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 12, backgroundColor: couleurs.fondDegrade },
  avisTexte: { color: couleurs.encre, fontSize: 12 }
});