import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EnteteEcran } from '../components/EnteteEcran';
import { Carte } from '../components/Carte';
import { couleurs, espacement } from '../theme';
import { recetteRepository } from '../repositories/recetteRepository';
import { planRepository } from '../repositories/planRepository';

// Remplace un repas du plan par une recette de la personne.
// C'est le seul chemin par lequel une recette locale entre dans un plan,
// et donc dans la liste de courses : les recettes venues de l'API ne
// peuvent pas etre chiffrees (leurs ingredients ne sont pas conserves).
//
// Parametres de navigation : { planHebdoId, repasId, libelleRepas }.
export function EcranChoisirRecette({ route, navigation }) {
  const { planHebdoId, repasId, libelleRepas } = route.params;
  const [recettes, setRecettes] = useState([]);
  const [enCours, setEnCours] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let annule = false;
      recetteRepository.lister().then((liste) => {
        if (!annule) setRecettes(liste);
      });
      return () => {
        annule = true;
      };
    }, [])
  );

  async function choisir(recette) {
    if (enCours) return;
    setEnCours(true);
    await planRepository.remplacerRepas(planHebdoId, repasId, recette.id);
    navigation.goBack();
  }

  return (
    <View style={styles.ecran}>
      <EnteteEcran
        titre="Mes recettes"
        sousTitre={libelleRepas ? `Remplacer le ${libelleRepas.toLowerCase()}` : 'Remplacer ce repas'}
        onRetour={() => navigation.goBack()}
      />

      <FlatList
        data={recettes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.liste}
        renderItem={({ item }) => (
          <Pressable onPress={() => choisir(item)} style={({ pressed }) => [pressed && styles.pressee]}>
            <Carte style={styles.carte}>
              <Text style={styles.emoji}>{item.emoji ?? '🍽️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.titre}>{item.nomFr}</Text>
                <Text style={styles.meta}>
                  {item.nombrePortions} portions
                  {item.tempsPreparation ? ` · ${item.tempsPreparation} min` : ''}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Carte>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.vide}>
            Tu n'as pas encore de recette. Crée-en une dans l'onglet Recettes, puis reviens ici.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  liste: { padding: espacement.md, gap: 10 },
  carte: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressee: { opacity: 0.6 },
  emoji: { fontSize: 26 },
  titre: { fontSize: 15, fontWeight: '700', color: couleurs.encre },
  meta: { fontSize: 12, color: couleurs.encreDouce, marginTop: 2 },
  chevron: { fontSize: 22, color: couleurs.encreDouce },
  vide: { fontSize: 13, color: couleurs.encreDouce, textAlign: 'center', paddingVertical: 24, paddingHorizontal: 16 }
});