import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { coursesRepository } from '../repositories/coursesRepository';
import { planRepository } from '../repositories/planRepository';
import { recetteRepository } from '../repositories/recetteRepository';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { Carte } from '../components/Carte';
import { EnteteEcran } from '../components/EnteteEcran';
import { Puce } from '../components/Puce';
import { couleurs, espacement } from '../theme';

// Associe un emoji a un ingredient a partir de mots-cles dans son nom.
// Purement decoratif : si aucun mot-cle ne correspond, on retombe sur
// le panier 🛒.
const EMOJI_PAR_MOT_CLE = [
  [['boeuf', 'bœuf', 'poulet', 'viande'], '🥩'],
  [['oignon', 'ail'], '🧅'],
  [['tomate'], '🍅'],
  [['riz'], '🍚'],
  [['huile'], '🫒'],
  [['sel', 'poivre', 'epice', 'épice'], '🧂'],
  [['carotte'], '🥕'],
  [['lait', 'creme', 'crème', 'fromage'], '🧀'],
  [['oeuf', 'œuf'], '🥚'],
  [['pain'], '🍞']
];

function emojiPourIngredient(nom) {
  const nomMinuscule = nom.toLowerCase();
  const trouve = EMOJI_PAR_MOT_CLE.find(([motsCles]) => motsCles.some((mot) => nomMinuscule.includes(mot)));
  return trouve ? trouve[1] : '🛒';
}

// Ecran "Liste" : cas d'utilisation "Preparer sa liste d'epicerie" et
// "Suivre le cout de sa semaine". Affiche la liste de courses du plan
// courant si elle existe deja ; la generation des lignes a partir des
// recettes du plan se fait ailleurs, via coursesRepository.creerListe().
export function EcranListe() {
  const [liste, setListe] = useState(null);
  const [lignes, setLignes] = useState([]);
  const [groupes, setGroupes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let annule = false;
      (async () => {
        const plan = await planRepository.obtenirDernierPlan();
        if (!plan || annule) return;

        const listeCourante = await coursesRepository.obtenirParPlan(plan.id);
        if (annule) return;
        setListe(listeCourante);
        if (!listeCourante) {
          setLignes([]);
          setGroupes([]);
          return;
        }

        // Les lignes ne portent que l'id de l'ingredient (pas de
        // jointure dans un stockage cle-valeur) : on resout le nom
        // affichable ici, cote ecran, via le referentiel.
        const [lignesBrutes, ingredients, repas] = await Promise.all([
          coursesRepository.listerLignes(listeCourante.id),
          referentielsRepository.listerIngredients(),
          planRepository.listerRepas(plan.id)
        ]);
        if (annule) return;

        // Association ingredient -> recette(s) : on recupere les
        // recettes du plan et on regarde lesquelles utilisent chaque
        // ingredient, pour pouvoir grouper l'affichage par recette.
        // Un ingredient peut venir de plusieurs recettes a la fois
        // (ex. oignon dans deux plats).
        const idsRecettesUniques = [...new Set(repas.map((r) => r.recetteId).filter(Boolean))];
        const recettes = (await Promise.all(idsRecettesUniques.map((id) => recetteRepository.obtenirParId(id)))).filter(
          Boolean
        );

        const recettesParIngredient = new Map();
        recettes.forEach((recette) => {
          recette.ingredients.forEach((ing) => {
            const recettesDejaVues = recettesParIngredient.get(ing.ingredientId) ?? [];
            if (!recettesDejaVues.some((r) => r.id === recette.id)) recettesDejaVues.push(recette);
            recettesParIngredient.set(ing.ingredientId, recettesDejaVues);
          });
        });

        const lignesAvecNom = lignesBrutes.map((ligne) => {
          const ingredient = ingredients.find((i) => i.id === ligne.ingredientId);
          const nom = ingredient ? ingredient.nomFr : 'Ingrédient';
          const recettesOrigine = recettesParIngredient.get(ligne.ingredientId) ?? [];
          return { ...ligne, nom, emoji: emojiPourIngredient(nom), recettesOrigine };
        });
        setLignes(lignesAvecNom);

        // Regroupement par recette d'origine (une section par recette,
        // + "Autres ingrédients" pour ce qui n'est rattaché a aucune
        // recette connue, ex. ajoute a la main).
        const sections = recettes.map((recette) => ({
          cle: String(recette.id),
          titre: `${recette.emoji ?? '🍽️'} ${recette.nomFr}`,
          lignes: lignesAvecNom.filter((l) => l.recettesOrigine.some((r) => r.id === recette.id))
        }));
        const sansRecette = lignesAvecNom.filter((l) => l.recettesOrigine.length === 0);
        if (sansRecette.length > 0) {
          sections.push({ cle: 'autres', titre: '🧺 Autres ingrédients', lignes: sansRecette });
        }
        setGroupes(sections.filter((s) => s.lignes.length > 0));
      })();
      return () => {
        annule = true;
      };
    }, [])
  );

  async function basculerAchete(ligne) {
    if (!liste) return;
    await coursesRepository.cocherLigne(liste.id, ligne.id, !ligne.estAchete);
    const bascule = (l) => (l.id === ligne.id ? { ...l, estAchete: !l.estAchete } : l);
    setLignes((prec) => prec.map(bascule));
    setGroupes((prec) => prec.map((g) => ({ ...g, lignes: g.lignes.map(bascule) })));
  }

  const articlesRestants = lignes.filter((l) => !l.estAchete).length;
  // Montant qui reste a depenser : le total estime moins ce qui est
  // deja coche comme achete.
  const montantRestant = lignes.reduce((somme, l) => (l.estAchete ? somme : somme + l.sousTotal), 0);

  return (
    <SafeAreaView style={styles.ecran} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <EnteteEcran titre="🛒 Liste de courses" sousTitre="Pour la semaine en cours" />

        {liste ? (
          <Carte style={styles.carteTotal}>
            <View style={styles.totalLigne}>
              <Text style={styles.totalEmoji}>🧺</Text>
              <View style={styles.totalTexte}>
                <Text style={styles.totalMontant}>{montantRestant.toFixed(2)} {liste.deviseCode}</Text>
                <Text style={styles.totalLegende}>
                  {articlesRestants > 0
                    ? `à acheter · sur ${liste.montantEstime.toFixed(2)} ${liste.deviseCode} au total`
                    : 'Tout est dans le panier ! 🎉'}
                </Text>
              </View>
            </View>
            {liste.recettesNonChiffrees > 0 ? (
              <Puce texte={`⚠️ ${liste.recettesNonChiffrees} recette(s) non chiffrée(s)`} />
            ) : null}
          </Carte>
        ) : null}

        {lignes.length === 0 ? (
          <Carte style={styles.carte}>
            <Text style={styles.videTexte}>🍽️ Génère d'abord un plan pour voir ta liste.</Text>
          </Carte>
        ) : (
          groupes.map((groupe) => (
            <View key={groupe.cle} style={styles.groupe}>
              <Text style={styles.groupeTitre}>{groupe.titre}</Text>
              <Carte style={styles.carte}>
                {groupe.lignes.map((ligne, index) => (
                  <Pressable
                    key={ligne.id}
                    onPress={() => basculerAchete(ligne)}
                    style={[styles.ligne, index < groupe.lignes.length - 1 && styles.ligneSeparee]}
                  >
                    <Text style={styles.ligneEmoji}>{ligne.emoji}</Text>

                    <View style={styles.ligneTexte}>
                      <Text style={[styles.ligneNom, ligne.estAchete && styles.texteAchete]}>{ligne.nom}</Text>
                      <Text style={styles.ligneQuantite}>
                        {ligne.quantite} {ligne.codeUnite}
                        {ligne.recettesOrigine.length > 1 ? ' · partagé entre recettes' : ''}
                      </Text>
                    </View>

                    <Text style={[styles.lignePrix, ligne.estAchete && styles.texteAchete]}>
                      {ligne.sousTotal.toFixed(2)} $
                    </Text>

                    <View style={[styles.rond, ligne.estAchete && styles.rondCoche]}>
                      {ligne.estAchete ? <Text style={styles.rondTexte}>✓</Text> : null}
                    </View>
                  </Pressable>
                ))}
              </Carte>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  contenu: { padding: espacement.md, gap: espacement.md, paddingBottom: espacement.xl },

  carteTotal: { paddingVertical: espacement.md, gap: espacement.sm, backgroundColor: couleurs.fondDegrade, borderColor: couleurs.primaire },
  totalLigne: { flexDirection: 'row', alignItems: 'center', gap: espacement.sm },
  totalEmoji: { fontSize: 32 },
  totalTexte: { flex: 1 },
  totalMontant: { fontSize: 24, fontWeight: '700', color: couleurs.primaireFonce },
  totalLegende: { fontSize: 12, color: couleurs.encreDouce },

  groupe: { gap: espacement.xs },
  groupeTitre: { fontSize: 14, fontWeight: '700', color: couleurs.encre, paddingLeft: 4 },
  carte: { paddingVertical: espacement.sm },
  videTexte: { fontSize: 14, color: couleurs.encreDouce, textAlign: 'center', paddingVertical: espacement.lg },

  ligne: { flexDirection: 'row', alignItems: 'center', gap: espacement.sm, paddingVertical: espacement.sm },
  ligneSeparee: { borderBottomWidth: 1, borderColor: couleurs.separateur },
  ligneEmoji: { fontSize: 22 },
  ligneTexte: { flex: 1 },
  ligneNom: { fontSize: 14, fontWeight: '600', color: couleurs.encre },
  ligneQuantite: { fontSize: 12, color: couleurs.encreDouce },
  lignePrix: { fontSize: 14, fontWeight: '600', color: couleurs.encre },
  texteAchete: { color: couleurs.encreDouce, textDecorationLine: 'line-through' },

  rond: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rondCoche: { backgroundColor: couleurs.primaire, borderColor: couleurs.primaire },
  rondTexte: { color: couleurs.blanc, fontSize: 12, fontWeight: '700' }
});
