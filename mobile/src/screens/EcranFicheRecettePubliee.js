import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bouton } from '../components/Bouton';
import { Carte } from '../components/Carte';
import { Puce } from '../components/Puce';
import { EnteteEcran } from '../components/EnteteEcran';
import { couleurs, rayon } from '../theme';
import { clientSofra } from '../services/clientSofra';
import { adapterRecettePubliee, titreAffiche } from '../services/communauteService';

// Une recette du fil de la communaute, lue en entier.
//
// Elle vient du serveur et reste sur le serveur : rien n'est enregistre
// sur l'appareil tant que la personne n'appuie pas sur "Adapter". C'est
// a ce moment-la que la copie devient sa recette, avec ses ingredients
// passes par la normalisation locale.
//
// Parametre de navigation : { id } (identifiant de la recette publiee).
export function EcranFicheRecettePubliee({ route, navigation }) {
  const { id } = route.params;
  const [recette, setRecette] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [adaptation, setAdaptation] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let annule = false;
      setChargement(true);
      setErreur(null);
      clientSofra
        .lireRecettePubliee(id)
        .then((reponse) => {
          if (!annule) setRecette(reponse.recette);
        })
        .catch((e) => {
          if (!annule) setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
        })
        .finally(() => {
          if (!annule) setChargement(false);
        });
      return () => {
        annule = true;
      };
    }, [id])
  );

  async function adapter() {
    if (!recette) return;
    setAdaptation(true);
    setErreur(null);
    try {
      const nouvelle = await adapterRecettePubliee(recette);
      // On ouvre directement la copie : la personne voit tout de suite
      // que la recette est devenue la sienne, et peut la modifier.
      navigation.navigate('FicheRecette', { id: nouvelle.id });
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setAdaptation(false);
    }
  }

  return (
    <View style={styles.ecran}>
      <EnteteEcran
        titre={recette ? titreAffiche(recette) : 'Recette'}
        sousTitre="Recette de la communauté"
        onRetour={() => navigation.goBack()}
      />

      {chargement ? (
        <View style={styles.centre}>
          <ActivityIndicator color={couleurs.primaire} />
        </View>
      ) : erreur && !recette ? (
        <View style={styles.centre}>
          <Text style={styles.erreurTexte}>{erreur}</Text>
        </View>
      ) : recette ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: 60 }}>
          <View style={{ gap: 8 }}>
            <Text style={styles.auteur}>Par {recette.auteur?.nomAffiche ?? 'Membre'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {recette.tempsPreparation ? <Puce texte={`${recette.tempsPreparation} min`} /> : null}
              <Puce texte={`${recette.nombrePortions} portions`} />
              {recette.categorie ? <Puce texte={recette.categorie} /> : null}
            </View>
          </View>

          <Bouton titre="Adapter dans mes recettes" onPress={adapter} enChargement={adaptation} />
          <Text style={styles.note}>
            La copie devient ta recette : tu peux la modifier, la mettre dans ton plan et la chiffrer dans ta liste.
          </Text>

          {erreur ? (
            <View style={styles.avisErreur}>
              <Text style={styles.avisErreurTexte}>{erreur}</Text>
            </View>
          ) : null}

          <View style={{ gap: 8 }}>
            <Text style={styles.sectionTitre}>Ingrédients</Text>
            <Carte style={{ paddingVertical: 4 }}>
              {recette.ingredients.map((ing, index) => (
                <View
                  key={`${ing.nom}-${index}`}
                  style={[styles.ligneIngredient, index < recette.ingredients.length - 1 && styles.avecSeparateur]}
                >
                  <Text style={styles.ingredientNom}>{ing.nom}</Text>
                  <Text style={styles.ingredientQte}>
                    {ing.quantite} {ing.unite}
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
                  <Text style={styles.texteEtape}>{etape.texte}</Text>
                </View>
              ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  erreurTexte: { color: couleurs.primaireFonce, fontSize: 14, textAlign: 'center' },
  auteur: { fontSize: 14, color: couleurs.encreDouce },
  note: { fontSize: 12, color: couleurs.encreDouce, marginTop: -12 },
  sectionTitre: { fontSize: 17, fontWeight: '600', color: couleurs.encre },
  avisErreur: { backgroundColor: '#FBE9E2', borderRadius: rayon.carteCompacte, padding: 12 },
  avisErreurTexte: { fontSize: 13, color: couleurs.primaireFonce, lineHeight: 18 },
  ligneIngredient: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, gap: 12 },
  avecSeparateur: { borderBottomWidth: 1, borderColor: couleurs.separateur },
  ingredientNom: { flex: 1, fontSize: 15, color: couleurs.encre },
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