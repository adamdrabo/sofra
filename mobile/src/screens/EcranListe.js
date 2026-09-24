import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { coursesRepository } from '../repositories/coursesRepository';
import { planRepository } from '../repositories/planRepository';
import { recetteRepository } from '../repositories/recetteRepository';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { Bouton } from '../components/Bouton';
import { Carte } from '../components/Carte';
import { EnteteEcran } from '../components/EnteteEcran';
import { ModalSaisiePrix } from '../components/ModalSaisiePrix';
import { Puce } from '../components/Puce';
import { prixRepository } from '../repositories/prixRepository';
import { genererListeDuPlan } from '../services/listeService';
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
// "Suivre le cout de sa semaine". La liste est calculee depuis le plan ;
// la personne peut cocher ce qu'elle achete, corriger un prix, et
// enregistrer ce qu'elle a vraiment depense.
export function EcranListe() {
  const [liste, setListe] = useState(null);
  const [lignes, setLignes] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [enChargement, setEnChargement] = useState(false);
  const [message, setMessage] = useState(null);
  // Change a chaque generation, pour forcer le rechargement de l'ecran.
  const [version, setVersion] = useState(0);
  // Ligne dont on saisit le prix (null quand la feuille est fermee).
  const [ligneEnEdition, setLigneEnEdition] = useState(null);
  const [montantReelSaisi, setMontantReelSaisi] = useState('');

  // Calcule la liste a partir du plan courant (service listeService).
  // Seules les recettes locales sont chiffrees : les repas venus de
  // l'API sont comptes a part, la licence interdisant de conserver
  // leurs ingredients.
  async function genererListe() {
    setEnChargement(true);
    setMessage(null);
    try {
      const plan = await planRepository.obtenirDernierPlan();
      if (!plan) {
        setMessage("Génère d'abord un plan dans l'onglet Semaine.");
        return;
      }
      const resultat = await genererListeDuPlan(plan.id);
      setMessage(
        resultat.repasChiffres === 0
          ? "Aucun repas du plan ne vient de tes recettes. Fais un appui long sur un repas de la semaine pour le remplacer par une des tiennes."
          : `Liste calculée à partir de ${resultat.repasChiffres} repas sur ${resultat.totalRepas}.`
      );
      setVersion((v) => v + 1);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setEnChargement(false);
    }
  }

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
    }, [version])
  );

  // Enregistre un PRIX_PERSONNALISE puis l'applique a la ligne.
  // Les deux ecritures sont distinctes : le prix appartient a
  // l'ingredient et resservira pour les prochaines listes, la ligne
  // n'en garde que le resultat.
  async function enregistrerPrix({ prix, quantite, magasin }) {
    const ligne = ligneEnEdition;
    if (!liste || !ligne) return;

    await prixRepository.ajouterPrixPersonnalise(ligne.ingredientId, prix, quantite, ligne.codeUnite, magasin);
    await coursesRepository.majPrixLigne(liste.id, ligne.id, prix / quantite, 'PERSONNALISE');

    setLigneEnEdition(null);
    setVersion((v) => v + 1);
  }

  async function enregistrerMontantReel() {
    if (!liste) return;
    const saisie = montantReelSaisi.trim();
    // Champ vide : on ne remplace pas montantReel par zero, sinon
    // l'ecran annoncerait une economie alors que rien n'a ete saisi.
    if (saisie === '') return;
    const montant = Number(saisie.replace(',', '.'));
    if (!Number.isFinite(montant) || montant < 0) return;
    await coursesRepository.enregistrerMontantReel(liste.id, montant);
    setVersion((v) => v + 1);
  }

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
    <View style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <EnteteEcran
          titre="🛒 Liste de courses"
          sousTitre="Touche pour cocher, appui long pour entrer ton prix"
        />

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

            {/* Depense reelle, saisie apres l'epicerie. C'est le seul
                endroit ou l'estimation et la depense se rencontrent. */}
            <View style={styles.reelLigne}>
              <Text style={styles.reelLibelle}>Dépensé en vrai</Text>
              <TextInput
                value={montantReelSaisi}
                onChangeText={setMontantReelSaisi}
                onBlur={enregistrerMontantReel}
                keyboardType="decimal-pad"
                placeholder={liste.montantReel != null ? liste.montantReel.toFixed(2) : '0.00'}
                style={styles.reelSaisie}
              />
            </View>
            {liste.montantReel != null ? (
              <Text style={styles.reelEcart}>
                {liste.montantReel > liste.montantEstime
                  ? `${(liste.montantReel - liste.montantEstime).toFixed(2)} ${liste.deviseCode} de plus que prévu`
                  : `${(liste.montantEstime - liste.montantReel).toFixed(2)} ${liste.deviseCode} d'économisé`}
              </Text>
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
                    onLongPress={() => setLigneEnEdition(ligne)}
                    delayLongPress={350}
                    style={[styles.ligne, index < groupe.lignes.length - 1 && styles.ligneSeparee]}
                  >
                    <Text style={styles.ligneEmoji}>{ligne.emoji}</Text>

                    <View style={styles.ligneTexte}>
                      <Text style={[styles.ligneNom, ligne.estAchete && styles.texteAchete]}>{ligne.nom}</Text>
                      <Text style={styles.ligneQuantite}>
                        {ligne.quantite} {ligne.codeUnite}
                        {ligne.recettesOrigine.length > 1 ? ' · partagé entre recettes' : ''}
                        {ligne.sourcePrix === 'PERSONNALISE' ? ' · ton prix' : ''}
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

        {message ? (
          <Carte style={styles.carte}>
            <Text style={styles.videTexte}>{message}</Text>
          </Carte>
        ) : null}

        <Bouton
          titre={liste ? 'Regénérer ma liste' : 'Générer ma liste'}
          onPress={genererListe}
          enChargement={enChargement}
        />
      </ScrollView>

      <ModalSaisiePrix
        visible={ligneEnEdition != null}
        ligne={ligneEnEdition}
        onFermer={() => setLigneEnEdition(null)}
        onEnregistrerPrix={enregistrerPrix}
      />
    </View>
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

  reelLigne: { flexDirection: 'row', alignItems: 'center', gap: espacement.sm },
  reelLibelle: { flex: 1, fontSize: 13, color: couleurs.encreDouce },
  reelSaisie: {
    width: 110,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    textAlign: 'right',
    color: couleurs.encre,
    backgroundColor: couleurs.blanc
  },
  reelEcart: { fontSize: 12, color: couleurs.primaireFonce },

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