import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EnteteEcran } from '../components/EnteteEcran';
import { Carte } from '../components/Carte';
import { couleurs, espacement } from '../theme';
import { clientSofra } from '../services/clientSofra';

// Fil de la communaute : chronologique, du plus recent au plus ancien.
// Pas de tri, pas de popularite, pas de recherche (decision de produit).
// La lecture est ouverte : aucun compte n'est demande pour consulter.
export function EcranFil() {
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
      month: 'long'
    });
  }

  return (
    <View style={styles.ecran}>
      <EnteteEcran titre="Communauté" sousTitre="Les recettes partagées par les membres" />

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
          refreshControl={<RefreshControl refreshing={rafraichit} onRefresh={rafraichir} tintColor={couleurs.primaire} />}
          renderItem={({ item }) => (
            // Pas encore de fiche pour une recette publiee : l'ecran
            // "FicheRecette" lit le stockage local et ne saurait pas
            // l'afficher. La carte montre donc l'essentiel sur place.
            <Carte style={styles.carte}>
              <Text style={styles.titre} numberOfLines={2}>
                {titreAffiche(item)}
              </Text>
              <Text style={styles.meta}>
                Par {auteurAffiche(item)}
                {dateAffichee(item) ? ` · ${dateAffichee(item)}` : ''}
              </Text>
              <Text style={styles.details}>
                {item.nombrePortions} portion(s)
                {item.tempsPreparation ? ` · ${item.tempsPreparation} min` : ''}
                {item.ingredients?.length ? ` · ${item.ingredients.length} ingrédients` : ''}
              </Text>
            </Carte>
          )}
          ListEmptyComponent={
            erreur ? null : <Text style={styles.vide}>Aucune recette publiée pour le moment.</Text>
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
  carte: { gap: 4 },
  titre: { fontSize: 16, fontWeight: '700', color: couleurs.encre },
  meta: { fontSize: 13, color: couleurs.encreDouce },
  details: { fontSize: 12, color: couleurs.encreDouce },
  vide: { fontSize: 13, color: couleurs.encreDouce, textAlign: 'center', paddingVertical: 24 },
  erreur: { marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 12, backgroundColor: '#FBE9E2' },
  erreurTexte: { color: couleurs.primaireFonce, fontSize: 13 }
});