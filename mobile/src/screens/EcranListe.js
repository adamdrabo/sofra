import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { coursesRepository } from '../repositories/coursesRepository';
import { planRepository } from '../repositories/planRepository';
import { prixRepository } from '../repositories/prixRepository';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { Bouton } from '../components/Bouton';
import { Carte } from '../components/Carte';
import { EnteteEcran } from '../components/EnteteEcran';
import { ModalLigneCourses } from '../components/ModalLigneCourses';
import { ModalNormalisationIngredient } from '../components/ModalNormalisationIngredient';
import { RAYONS, rayonPourIngredient } from '../constants/rayons';
import { obtenirPrixRetenu } from '../services/coutService';
import { genererListeDuPlan } from '../services/listeService';
import { couleurs, espacement } from '../theme';
import { useEspacementBarreOnglets } from '../hooks/useEspacementBarreOnglets';

export function EcranListe() {

  const espacementBarre = useEspacementBarreOnglets();
  const [plan, setPlan] = useState(null);
  const [liste, setListe] = useState(null);
  const [lignes, setLignes] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [unites, setUnites] = useState([]);
  const [enChargement, setEnChargement] = useState(false);
  const [message, setMessage] = useState(null);
  const [version, setVersion] = useState(0);
  const [ligneEnEdition, setLigneEnEdition] = useState(null);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [montantReelSaisi, setMontantReelSaisi] = useState('');

  useFocusEffect(
    useCallback(() => {
      let annule = false;
      (async () => {
        const [dernierPlan, listeUnites, ingredients] = await Promise.all([
          planRepository.obtenirDernierPlan(),
          referentielsRepository.listerUnites(),
          referentielsRepository.listerIngredients()
        ]);
        if (annule) return;
        setUnites(listeUnites);
        setPlan(dernierPlan);

        if (!dernierPlan) {
          setListe(null);
          setLignes([]);
          setGroupes([]);
          return;
        }

        const listeCourante = await coursesRepository.obtenirParPlan(dernierPlan.id);
        if (annule) return;
        setListe(listeCourante);

        if (!listeCourante) {
          setLignes([]);
          setGroupes([]);
          return;
        }


        const lignesCompletes = listeCourante.lignes.map((ligne) => {
          const ingredient = ingredients.find((i) => i.id === ligne.ingredientId);
          return {
            ...ligne,
            nom: ingredient ? ingredient.nomFr : 'Ingrédient',
            rayon: rayonPourIngredient(ingredient)
          };
        });
        setLignes(lignesCompletes);

        setGroupes(
          RAYONS.map((r) => ({ ...r, lignes: lignesCompletes.filter((l) => l.rayon === r.code) })).filter(
            (r) => r.lignes.length > 0
          )
        );
      })();
      return () => {
        annule = true;
      };
    }, [version])
  );

  async function genererListe() {
    setEnChargement(true);
    setMessage(null);
    try {
      if (!plan) {
        setMessage("Génère d'abord un plan dans l'onglet Semaine.");
        return;
      }
      const resultat = await genererListeDuPlan(plan.id);
      setMessage(
        resultat.repasChiffres === 0
          ? "Aucun repas du plan ne vient de tes recettes. Fais un appui long sur un repas de la semaine pour le remplacer par une des tiennes."
          : null
      );
      setVersion((v) => v + 1);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setEnChargement(false);
    }
  }

  async function enregistrerLigne({ quantite, codeUnite, facteurVersBase, prix }) {
    const ligne = ligneEnEdition;
    if (!liste || !ligne) return;

    const champs = { quantite, codeUnite, facteurVersBase };

    if (prix) {
      await prixRepository.ajouterPrixPersonnalise(ligne.ingredientId, prix.prix, prix.quantite, codeUnite, prix.magasin);
      champs.prixUnitaire = prix.prix / prix.quantite / (facteurVersBase || 1);
      champs.sourcePrix = 'PERSONNALISE';
    }

    await coursesRepository.majLigne(liste.id, ligne.id, champs);
    setLigneEnEdition(null);
    setVersion((v) => v + 1);
  }

  async function supprimerLigne(ligne) {
    if (!liste) return;
    await coursesRepository.supprimerLigne(liste.id, ligne.id);
    setLigneEnEdition(null);
    setVersion((v) => v + 1);
  }

  async function ajouterArticle(choix) {
    setAjoutOuvert(false);
    if (!liste) return;

    const unite = unites.find((u) => u.code === choix.codeUnite);
    const { prixUnitaire, sourcePrix } = await obtenirPrixRetenu(choix.ingredient.id);

    const compatible = unite?.codeUniteBase === choix.ingredient.codeUniteBase;

    await coursesRepository.ajouterLigne(liste.id, {
      ingredientId: choix.ingredient.id,
      quantite: choix.quantite,
      codeUnite: choix.codeUnite,
      facteurVersBase: compatible ? unite.facteurVersBase : 1,
      prixUnitaire: compatible ? prixUnitaire : 0,
      sourcePrix: compatible ? sourcePrix : 'AUCUN'
    });
    setVersion((v) => v + 1);
  }

  async function enregistrerMontantReel() {
    if (!liste) return;
    const saisie = montantReelSaisi.trim();
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

  const articlesCoches = lignes.filter((l) => l.estAchete).length;
  const montantRestant = lignes.reduce((somme, l) => (l.estAchete ? somme : somme + l.sousTotal), 0);

  function semaineAffichee() {
    if (!plan?.dateDebut) return null;
    const debut = new Date(plan.dateDebut);
    const fin = new Date(debut);
    fin.setDate(fin.getDate() + 6);
    return `Semaine du ${debut.getDate()} au ${fin.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })}`;
  }

  const repasCouverts = plan && liste ? plan.repas.length - liste.recettesNonChiffrees : 0;

  return (
    <View style={styles.ecran}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { paddingBottom: espacementBarre + (liste ? 170 : 0) }]}
        keyboardShouldPersistTaps="handled"
      >
        <EnteteEcran
          titre="Liste d'épicerie"
          sousTitre={
            liste
              ? `${semaineAffichee() ?? 'Semaine en cours'} · ${articlesCoches} sur ${lignes.length} articles cochés`
              : 'Pour la semaine en cours'
          }
        />

        {liste ? (
          <Text style={styles.origine}>Générée depuis Ma semaine · appui long sur un article pour le modifier</Text>
        ) : null}

        {groupes.map((groupe) => (
          <View key={groupe.code} style={styles.groupe}>
            <Text style={styles.groupeTitre}>
              {groupe.emoji} {groupe.libelle}
            </Text>
            <Carte style={styles.carte}>
              {groupe.lignes.map((ligne, index) => (
                <Pressable
                  key={ligne.id}
                  onPress={() => basculerAchete(ligne)}
                  onLongPress={() => setLigneEnEdition(ligne)}
                  delayLongPress={350}
                  style={[styles.ligne, index < groupe.lignes.length - 1 && styles.ligneSeparee]}
                >
                  <View style={[styles.rond, ligne.estAchete && styles.rondCoche]}>
                    {ligne.estAchete ? <Text style={styles.rondTexte}>✓</Text> : null}
                  </View>

                  <View style={styles.ligneTexte}>
                    <Text style={[styles.ligneNom, ligne.estAchete && styles.texteAchete]}>{ligne.nom}</Text>
                    <Text style={styles.ligneDetail}>
                      {ligne.sourcePrix === 'AUCUN' ? 'prix indisponible' : `${ligne.sousTotal.toFixed(2)} $`}
                      {ligne.sourcePrix === 'PERSONNALISE' ? ' · ton prix' : ''}
                      {ligne.provenance === 'MANUELLE' ? ' · ajouté' : ''}
                    </Text>
                  </View>

                  <Text style={[styles.ligneQuantite, ligne.estAchete && styles.texteAchete]}>
                    {ligne.quantite} {ligne.codeUnite}
                  </Text>
                </Pressable>
              ))}
            </Carte>
          </View>
        ))}

        {lignes.length === 0 ? (
          <Carte style={styles.carte}>
            <Text style={styles.videTexte}>
              {plan ? 'Génère ta liste à partir du plan de la semaine.' : "Crée d'abord un plan dans l'onglet Semaine."}
            </Text>
          </Carte>
        ) : null}

        {message ? (
          <Carte style={styles.carte}>
            <Text style={styles.videTexte}>{message}</Text>
          </Carte>
        ) : null}

        {liste ? <Bouton titre="Ajouter un article" variante="contour" onPress={() => setAjoutOuvert(true)} /> : null}

        <Bouton
          titre={liste ? 'Regénérer ma liste' : 'Générer ma liste'}
          onPress={genererListe}
          enChargement={enChargement}
        />
      </ScrollView>

      {/* Pied fixe : le total suit la personne pendant qu'elle fait
          ses courses, sans avoir a redescendre la liste. */}
      {liste ? (
        <View style={[styles.pied, { bottom: espacementBarre }]}>
          <View style={styles.piedLigne}>
            <View style={{ flex: 1 }}>
              <Text style={styles.piedTitre}>Total estimé</Text>
              <Text style={styles.piedLegende}>
                Couvre {repasCouverts} repas sur {plan?.repas.length ?? 0} · prix indicatifs, Montréal
              </Text>
            </View>
            <Text style={styles.piedMontant}>
              {montantRestant.toFixed(2)} {liste.deviseCode}
            </Text>
          </View>

          <View style={styles.piedLigne}>
            <Text style={styles.piedLegende}>Dépensé en vrai</Text>
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
            <Text style={styles.piedEcart}>
              {liste.montantReel > liste.montantEstime
                ? `${(liste.montantReel - liste.montantEstime).toFixed(2)} ${liste.deviseCode} de plus que prévu`
                : `${(liste.montantEstime - liste.montantReel).toFixed(2)} ${liste.deviseCode} d'économisé`}
            </Text>
          ) : null}
        </View>
      ) : null}

      <ModalLigneCourses
        visible={ligneEnEdition != null}
        ligne={ligneEnEdition}
        unites={unites}
        onFermer={() => setLigneEnEdition(null)}
        onEnregistrer={enregistrerLigne}
        onSupprimer={supprimerLigne}
      />

      <ModalNormalisationIngredient
        visible={ajoutOuvert}
        onFermer={() => setAjoutOuvert(false)}
        onConfirmer={ajouterArticle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  contenu: { padding: espacement.md, gap: espacement.md, paddingBottom: 200 },
  origine: { fontSize: 12, color: couleurs.encreDouce, marginTop: -6 },

  groupe: { gap: espacement.xs },
  groupeTitre: { fontSize: 13, fontWeight: '700', color: couleurs.encreDouce, paddingLeft: 4 },
  carte: { paddingVertical: espacement.sm },
  videTexte: { fontSize: 14, color: couleurs.encreDouce, textAlign: 'center', paddingVertical: espacement.lg },

  ligne: { flexDirection: 'row', alignItems: 'center', gap: espacement.sm, paddingVertical: espacement.sm },
  ligneSeparee: { borderBottomWidth: 1, borderColor: couleurs.separateur },
  ligneTexte: { flex: 1 },
  ligneNom: { fontSize: 15, fontWeight: '600', color: couleurs.encre },
  ligneDetail: { fontSize: 12, color: couleurs.encreDouce, marginTop: 2 },
  ligneQuantite: { fontSize: 13, color: couleurs.encreDouce },
  texteAchete: { color: couleurs.encreDouce, textDecorationLine: 'line-through' },

  rond: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rondCoche: { backgroundColor: couleurs.primaire, borderColor: couleurs.primaire },
  rondTexte: { color: couleurs.blanc, fontSize: 13, fontWeight: '700' },

  pied: {
    position: 'absolute',
    left: 0,
    right: 0,

    backgroundColor: couleurs.blanc,
    borderTopWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacement.md,
    gap: 8
  },
  piedLigne: { flexDirection: 'row', alignItems: 'center', gap: espacement.sm },
  piedTitre: { fontSize: 15, fontWeight: '700', color: couleurs.encre },
  piedLegende: { flex: 1, fontSize: 12, color: couleurs.encreDouce },
  piedMontant: { fontSize: 22, fontWeight: '800', color: couleurs.encre },
  piedEcart: { fontSize: 12, color: couleurs.primaireFonce },
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
    backgroundColor: couleurs.fondEcran
  }
});