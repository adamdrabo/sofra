import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EnteteEcran } from '../components/EnteteEcran';
import { Bouton } from '../components/Bouton';
import { couleurs, rayon } from '../theme';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { recetteRepository } from '../repositories/recetteRepository';

// Ecran "Gestion des recettes" (onglet Recettes) : cas d'utilisation
// "Créer une recette" et "Adapter une recette de la communauté". Lit le
// vrai stockage local (AsyncStorage), ensemencé avec deux recettes
// d'exemple au premier lancement — voir src/db/seed.js.
export function EcranRecettes({ navigation }) {
  const [recettes, setRecettes] = useState([]);
  const [categories, setCategories] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let annule = false;
      (async () => {
        const [r, c] = await Promise.all([recetteRepository.lister(), referentielsRepository.listerCategories()]);
        if (!annule) {
          setRecettes(r);
          setCategories(c);
        }
      })();
      return () => {
        annule = true;
      };
    }, [])
  );

  function nomCategorie(id) {
    return categories.find((c) => c.id === id)?.nomFr ?? '';
  }

  return (
    <View style={styles.ecran}>
      <View style={{ paddingHorizontal: 20 }}>
        <EnteteEcran titre="Mes recettes" sousTitre={`${recettes.length} recettes personnelles`} />
      </View>

      <FlatList
        data={recettes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable style={styles.carte} onPress={() => navigation.navigate('FicheRecette', { id: item.id })}>
            <View style={styles.vignette}>
              <Text style={{ fontSize: 28 }}>{item.emoji ?? '🍽️'}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.nom}>{item.nomFr}</Text>
              <Text style={styles.details}>
                {nomCategorie(item.categorieId)} · {item.tempsPreparation} min · {item.nombrePortions} portions
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={{ paddingHorizontal: 20 }}>Aucune recette pour le moment.</Text>}
      />

      <View style={{ padding: 20, paddingTop: 0 }}>
        <Bouton titre="Nouvelle recette" onPress={() => navigation.navigate('NouvelleRecette')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran, paddingTop: 12 },
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: couleurs.blanc,
    borderRadius: rayon.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: 10
  },
  vignette: {
    width: 64,
    height: 64,
    borderRadius: rayon.carteCompacte,
    backgroundColor: couleurs.fondDegrade,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nom: { fontSize: 16, fontWeight: '600', color: couleurs.encre },
  details: { fontSize: 13, color: couleurs.encreDouce }
});
