import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Carte } from '../components/Carte';
import { Puce } from '../components/Puce';
import { EnteteEcran } from '../components/EnteteEcran';
import { couleurs, rayon } from '../theme';
import { clientSofra } from '../services/clientSofra';

// Fiche d'une recette venue de Spoonacular. Le detail est demande au
// serveur a chaque ouverture et n'est jamais ecrit dans le stockage
// local : la licence ne permet de conserver que l'identifiant, le titre
// et l'image (voir "affiche puis oublie" dans le document v5).
//
// Parametres de navigation : { idExterne, titre }.
export function EcranFicheRecetteExterne({ route, navigation }) {
  const { idExterne, titre } = route.params;
  const [recette, setRecette] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let annule = false;
      setChargement(true);
      setErreur(null);
      clientSofra
        .obtenirDetailRecette(idExterne)
        .then((donnees) => {
          if (!annule) setRecette(donnees);
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
    }, [idExterne])
  );

  return (
    <View style={styles.ecran}>
      <EnteteEcran
        titre={recette?.titre ?? titre ?? 'Recette'}
        sousTitre="Recette proposée dans ton plan"
        onRetour={() => navigation.goBack()}
      />

      {chargement ? (
        <View style={styles.centre}>
          <ActivityIndicator color={couleurs.primaire} />
        </View>
      ) : erreur ? (
        <View style={styles.centre}>
          <Text style={styles.erreurTexte}>{erreur}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 22 }}>
          {recette.imageUrl ? (
            <Image source={{ uri: recette.imageUrl }} style={styles.vignette} resizeMode="cover" />
          ) : (
            <View style={[styles.vignette, styles.vignetteVide]}>
              <Text style={{ fontSize: 56 }}>🍽️</Text>
            </View>
          )}

          {/* Deuxieme filet de securite : le serveur signale les termes
              interdits qu'il a trouves malgre le filtre de Spoonacular. */}
          {recette.alerteExclusion?.length > 0 ? (
            <View style={styles.alerte}>
              <Text style={styles.alerteTexte}>
                Cette recette mentionne un ingrédient exclu ({recette.alerteExclusion.join(', ')}). Régénère ton plan
                pour la remplacer.
              </Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {recette.tempsPreparation ? <Puce texte={`${recette.tempsPreparation} min`} /> : null}
            {recette.nombrePortions ? <Puce texte={`${recette.nombrePortions} portions`} /> : null}
          </View>

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
            {recette.etapes.length === 0 ? (
              <Text style={styles.note}>Les étapes ne sont pas fournies pour cette recette.</Text>
            ) : (
              recette.etapes.map((etape) => (
                <View key={etape.ordre} style={styles.ligneEtape}>
                  <View style={styles.numeroEtape}>
                    <Text style={styles.numeroEtapeTexte}>{etape.ordre}</Text>
                  </View>
                  <Text style={styles.texteEtape}>{etape.texte}</Text>
                </View>
              ))
            )}
          </View>

          {/* Attribution de la source, demandee par Spoonacular. */}
          {recette.credits ? <Text style={styles.note}>Source : {recette.credits}</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  erreurTexte: { color: couleurs.primaireFonce, fontSize: 14, textAlign: 'center' },
  vignette: { height: 180, borderRadius: rayon.carte, backgroundColor: couleurs.placeholderPhoto },
  vignetteVide: { alignItems: 'center', justifyContent: 'center' },
  alerte: { padding: 12, borderRadius: 12, backgroundColor: '#FBE9E2' },
  alerteTexte: { color: couleurs.primaireFonce, fontSize: 13, lineHeight: 19 },
  sectionTitre: { fontSize: 17, fontWeight: '600', color: couleurs.encre },
  note: { fontSize: 12, color: couleurs.encreDouce },
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
