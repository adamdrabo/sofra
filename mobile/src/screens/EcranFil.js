import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EnteteEcran } from '../components/EnteteEcran';
import { Carte } from '../components/Carte';
import { couleurs, espacement, rayon } from '../theme';
import { clientSofra } from '../services/clientSofra';

// Emoji de la vignette, choisi d'apres la categorie de la recette.
// Purement decoratif : le serveur ne renvoie aucune image pour une
// recette publiee, et la licence n'a rien a voir ici, c'est simplement
// que personne ne televerse de photo dans l'application.
const EMOJI_PAR_CATEGORIE = {
  'petit-déjeuner': '🥐',
  'plat principal': '🍲',
  accompagnement: '🥗',
  dessert: '🍰'
};

function emojiPourCategorie(categorie) {
  return EMOJI_PAR_CATEGORIE[String(categorie ?? '').toLowerCase()] ?? '🍽️';
}

// Fil de la communaute : chronologique, du plus recent au plus ancien.
// Pas de tri, pas de popularite, pas de recherche (decision de produit).
// La lecture est ouverte : aucun compte n'est demande pour consulter.
export function EcranFil({ navigation }) {
  const [recettes, setRecettes] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const reponse = await clientSofra.consulterFil(1);
      setRecettes(reponse.recettes);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let annule = false;
      setChargement(true);
      charger().finally(() => {
        if (!annule) setChargement(false);
      });
      return () => {
        annule = true;
      };
    }, [charger])
  );

  async function rafraichir() {
    setRafraichit(true);
    await charger();
    setRafraichit(false);
  }

  // Une recette publiee porte un titre dans au moins une langue,
  // pas forcement en francais : on prend la premiere disponible.
  function titreAffiche(recette) {
    return recette.titre?.fr || recette.titre?.en || recette.titre?.ar || 'Sans titre';
  }

  // L'auteur est absent si le compte a ete supprime depuis la publication :
  // la recette reste, elle appartient au fil.
  function auteurAffiche(recette) {
    return recette.auteur?.nomAffiche || 'Membre';
  }

  function dateAffichee(recette) {
    if (!recette.datePublication) return '';
    return new Date(recette.datePublication).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'short'
    });
  }

  return (
    <View style={styles.ecran}>
      <EnteteEcran
        titre="Communauté"
        sousTitre={
          recettes.length > 0
            ? `${recettes.length} recette${recettes.length > 1 ? 's' : ''} partagée${recettes.length > 1 ? 's' : ''} par les membres`
            : 'Les recettes partagées par les membres'
        }
      />

      {erreur ? (
        <View style={styles.erreur}>
          <Text style={styles.erreurTexte}>{erreur}</Text>
        </View>
      ) : null}

      {chargement ? (
        <View style={styles.centre}>
          <ActivityIndicator color={couleurs.primaire} />
        </View>
      ) : (
        <FlatList
          data={recettes}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.liste}
          refreshControl={
            <RefreshControl refreshing={rafraichit} onRefresh={rafraichir} tintColor={couleurs.primaire} />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('FicheRecettePubliee', { id: item._id })}
              style={({ pressed }) => [pressed && styles.pressee]}
            >
              <Carte style={styles.carte}>
                <View style={styles.vignette}>
                  <Text style={styles.vignetteEmoji}>{emojiPourCategorie(item.categorie)}</Text>
                </View>

                <View style={styles.corps}>
                  <Text style={styles.titre} numberOfLines={2}>
                    {titreAffiche(item)}
                  </Text>

                  {/* L'auteur est ce qui distingue le fil de mes propres
                      recettes : on lui donne un rond avec son initiale. */}
                  <View style={styles.ligneAuteur}>
                    <View style={styles.pastilleAuteur}>
                      <Text style={styles.pastilleAuteurTexte}>
                        {auteurAffiche(item).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.auteurNom} numberOfLines={1}>
                      {auteurAffiche(item)}
                    </Text>
                    {dateAffichee(item) ? <Text style={styles.date}>· {dateAffichee(item)}</Text> : null}
                  </View>

                  <View style={styles.details}>
                    <Text style={styles.detail}>
                      {item.nombrePortions} portion{item.nombrePortions > 1 ? 's' : ''}
                    </Text>
                    {item.tempsPreparation ? <Text style={styles.detail}>{item.tempsPreparation} min</Text> : null}
                    {item.ingredients?.length ? (
                      <Text style={styles.detail}>
                        {item.ingredients.length} ingrédient{item.ingredients.length > 1 ? 's' : ''}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <Text style={styles.chevron}>›</Text>
              </Carte>
            </Pressable>
          )}
          ListEmptyComponent={
            erreur ? null : (
              <View style={styles.vide}>
                <Text style={styles.videEmoji}>🍲</Text>
                <Text style={styles.videTitre}>Le fil est encore vide</Text>
                <Text style={styles.videTexte}>
                  Publie une de tes recettes depuis l’onglet Recettes pour la partager avec la communauté.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  liste: { paddingHorizontal: espacement.md, paddingBottom: 100, gap: 12 },

  carte: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: espacement.md },
  pressee: { opacity: 0.6 },

  vignette: {
    width: 54,
    height: 54,
    borderRadius: rayon.carteCompacte,
    backgroundColor: couleurs.fondDegrade,
    alignItems: 'center',
    justifyContent: 'center'
  },
  vignetteEmoji: { fontSize: 28 },

  corps: { flex: 1, gap: 5 },
  titre: { fontSize: 16, fontWeight: '700', color: couleurs.encre },

  ligneAuteur: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pastilleAuteur: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: couleurs.primaire,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pastilleAuteurTexte: { fontSize: 11, fontWeight: '800', color: couleurs.blanc },
  auteurNom: { fontSize: 13, fontWeight: '600', color: couleurs.encre, flexShrink: 1 },
  date: { fontSize: 12, color: couleurs.encreDouce },

  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  detail: {
    fontSize: 11,
    color: couleurs.encreDouce,
    backgroundColor: couleurs.fondEcran,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon.pastille,
    paddingHorizontal: 9,
    paddingVertical: 3,
    overflow: 'hidden'
  },

  chevron: { fontSize: 24, color: couleurs.encreDouce, paddingLeft: 2 },

  vide: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30, gap: 8 },
  videEmoji: { fontSize: 44 },
  videTitre: { fontSize: 16, fontWeight: '700', color: couleurs.encre },
  videTexte: { fontSize: 13, color: couleurs.encreDouce, textAlign: 'center', lineHeight: 19 }
});