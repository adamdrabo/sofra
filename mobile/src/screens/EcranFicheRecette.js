import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bouton } from '../components/Bouton';
import { Carte } from '../components/Carte';
import { Puce } from '../components/Puce';
import { couleurs, rayon } from '../theme';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { recetteRepository } from '../repositories/recetteRepository';

// Fiche recette (cas d'utilisation "Créer une recette" / "Adapter une
// recette"). Lit le vrai stockage local (AsyncStorage).
export function EcranFicheRecette({ route, navigation }) {
  const { id } = route.params;
  const [recette, setRecette] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [chargement, setChargement] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let annule = false;
      (async () => {
        const [r, ing] = await Promise.all([
          recetteRepository.obtenirParId(id),
          referentielsRepository.listerIngredients()
        ]);
        if (!annule) {
          setRecette(r);
          setIngredients(ing);
          setChargement(false);
        }
      })();
      return () => {
        annule = true;
      };
    }, [id])
  );

  if (chargement) return null;

  if (!recette) {
    return (
      <View style={styles.ecran}>
        <Text style={{ padding: 20 }}>Recette introuvable.</Text>
      </View>
    );
  }

  function nomIngredient(ingredientId) {
    return ingredients.find((i) => i.id === ingredientId)?.nomFr ?? 'Ingrédient';
  }

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={{ padding: 20, gap: 22 }}>
      <View style={styles.vignette}>
        <Text style={{ fontSize: 56 }}>{recette.emoji ?? '🍽️'}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={styles.titre}>{recette.nomFr}</Text>
        <Text style={styles.sousTitre}>Ma recette · sans porc ni alcool</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Puce texte={`${recette.tempsPreparation} min`} />
          <Puce texte={`${recette.nombrePortions} portions`} />
        </View>
      </View>

      <Bouton
        titre="Modifier cette recette"
        onPress={() => navigation.navigate('NouvelleRecette', { id: recette.id })}
      />

      <View style={{ gap: 8 }}>
        <Text style={styles.sectionTitre}>Ingrédients</Text>
        <Carte style={{ paddingVertical: 4 }}>
          {recette.ingredients.map((ing, index) => (
            <View
              key={`${ing.ingredientId}-${index}`}
              style={[styles.ligneIngredient, index < recette.ingredients.length - 1 && styles.avecSeparateur]}
            >
              <Text style={styles.ingredientNom}>{nomIngredient(ing.ingredientId)}</Text>
              <Text style={styles.ingredientQte}>
                {ing.quantite} {ing.codeUnite}
              </Text>
            </View>
          ))}
        </Carte>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitre}>Étapes</Text>
        {[...recette.etapes]
          .sort((a, b) => a.ordre - b.ordre)
          .map((etape) => (
            <View key={etape.ordre} style={styles.ligneEtape}>
              <View style={styles.numeroEtape}>
                <Text style={styles.numeroEtapeTexte}>{etape.ordre}</Text>
              </View>
              <Text style={styles.texteEtape}>{etape.texteFr}</Text>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  vignette: {
    height: 180,
    borderRadius: rayon.carte,
    backgroundColor: couleurs.placeholderPhoto,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titre: { fontSize: 26, fontWeight: '600', color: couleurs.encre },
  sousTitre: { fontSize: 14, color: couleurs.encreDouce },
  sectionTitre: { fontSize: 17, fontWeight: '600', color: couleurs.encre },
  ligneIngredient: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 },
  avecSeparateur: { borderBottomWidth: 1, borderColor: couleurs.separateur },
  ingredientNom: { fontSize: 15, color: couleurs.encre },
  ingredientQte: { fontSize: 13, color: couleurs.encreDouce },
  ligneEtape: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  numeroEtape: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: couleurs.primaire,
    alignItems: 'center',
    justifyContent: 'center'
  },
  numeroEtapeTexte: { fontSize: 13, fontWeight: '600', color: couleurs.primaire },
  texteEtape: { flex: 1, fontSize: 15, lineHeight: 21, color: couleurs.encre, paddingTop: 3 }
});
