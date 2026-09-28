import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { couleurs, rayon } from '../theme';
import { normaliserNom } from '../services/normalisation';
import { nettoyerNomIngredient, validerNomIngredient } from '../services/validationIngredient';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { Bouton } from './Bouton';

// Realise a l'ecran le composant "Normalisation" du modele : quoi que
// la personne tape, nomNormalise() decide si ca correspond a un
// ingredient deja connu dans le stockage local. On ne cree une
// nouvelle entree que si aucune correspondance n'existe (voir "Le champ
// qui porte tout le paquet" dans le document de conception).
export function ModalNormalisationIngredient({ visible, onFermer, onConfirmer }) {
  const [saisie, setSaisie] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [unites, setUnites] = useState([]);
  const [uniteChoisie, setUniteChoisie] = useState(null);
  const [ingredientsConnus, setIngredientsConnus] = useState([]);

  useEffect(() => {
    if (!visible) return;
    referentielsRepository.listerUnites().then((liste) => {
      setUnites(liste);
      setUniteChoisie((actuelle) => actuelle ?? liste[0] ?? null);
    });
    referentielsRepository.listerIngredients().then(setIngredientsConnus);
  }, [visible]);

  const nomNormaliseSaisi = useMemo(() => normaliserNom(saisie), [saisie]);

  // Un ingredient cree entre dans le referentiel pour de bon : il sert
  // de cle de regroupement dans la liste de courses et portera un prix.
  // On refuse donc les chiffres et les caracteres speciaux avant de le
  // creer.
  const validation = useMemo(() => validerNomIngredient(saisie), [saisie]);

  const correspondanceExacte = useMemo(
    () => ingredientsConnus.find((i) => i.nomNormalise === nomNormaliseSaisi) ?? null,
    [ingredientsConnus, nomNormaliseSaisi]
  );

  // Un ingredient connu est chiffre dans son unite de base : la tomate
  // a la piece, le riz au gramme. Proposer les kilos pour une tomate
  // multiplierait son prix par mille. On limite donc aux unites de la
  // meme famille des qu'on sait de quel ingredient il s'agit.
  const unitesProposees = useMemo(() => {
    if (!correspondanceExacte) return unites;
    return unites.filter((u) => u.codeUniteBase === correspondanceExacte.codeUniteBase);
  }, [unites, correspondanceExacte]);

  useEffect(() => {
    if (unitesProposees.length === 0) return;
    // L'unite choisie avant de reconnaitre l'ingredient peut ne plus
    // etre permise : on retombe sur la premiere compatible.
    if (!unitesProposees.some((u) => u.code === uniteChoisie?.code)) {
      setUniteChoisie(unitesProposees[0]);
    }
  }, [unitesProposees, uniteChoisie]);

  const suggestions = useMemo(() => {
    if (!saisie.trim()) return [];
    return ingredientsConnus
      .filter((i) => i.nomNormalise.includes(nomNormaliseSaisi) && i.nomNormalise !== nomNormaliseSaisi)
      .slice(0, 5);
  }, [ingredientsConnus, saisie, nomNormaliseSaisi]);

  function reinitialiser() {
    setSaisie('');
    setQuantite('1');
  }

  function choisirExistant(ingredient) {
    if (!uniteChoisie) return;
    onConfirmer({
      ingredient,
      quantite: Number(quantite) || 1,
      codeUnite: uniteChoisie.code
    });
    reinitialiser();
  }

  async function creerNouveau() {
    if (!uniteChoisie || !validation.valide) return;
    // Passe par referentielsRepository : c'est lui qui vérifie
    // nomNormalise avant de vraiment créer une nouvelle ligne.
    const ingredient = await referentielsRepository.trouverOuCreerIngredient(
      nettoyerNomIngredient(saisie),
      uniteChoisie.codeUniteBase
    );
    onConfirmer({
      ingredient,
      quantite: Number(quantite) || 1,
      codeUnite: uniteChoisie.code
    });
    reinitialiser();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onFermer}>
      <View style={styles.fond}>
        <View style={styles.feuille}>
          <Text style={styles.titre}>Ajouter un ingrédient</Text>

          <TextInput
            placeholder="Ex. Tomates"
            value={saisie}
            onChangeText={setSaisie}
            style={styles.champ}
            autoFocus
          />

          {/* Un ingredient deja connu est reutilise tel quel : la
              validation ne concerne que la creation d'un nouveau nom. */}
          {!correspondanceExacte && validation.message ? (
            <View style={styles.avisErreur}>
              <Text style={styles.avisErreurTexte}>{validation.message}</Text>
            </View>
          ) : null}

          {correspondanceExacte ? (
            <View style={styles.avisConnu}>
              <Text style={styles.avisConnuTexte}>
                Cet ingrédient existe déjà sous le nom « {correspondanceExacte.nomFr} ». Il sera réutilisé, pas dupliqué.
              </Text>
            </View>
          ) : null}

          {!correspondanceExacte && suggestions.length > 0 ? (
            <View style={{ gap: 6 }}>
              <Text style={styles.etiquette}>Ingrédients proches déjà connus</Text>
              {suggestions.map((s) => (
                <Pressable key={s.id} onPress={() => setSaisie(s.nomFr)} style={styles.suggestion}>
                  <Text style={styles.suggestionTexte}>{s.nomFr}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.ligneQuantite}>
            <TextInput
              value={quantite}
              onChangeText={setQuantite}
              keyboardType="decimal-pad"
              style={[styles.champ, { flex: 1 }]}
            />
            <FlatList
              horizontal
              data={unitesProposees}
              keyExtractor={(u) => u.code}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingLeft: 8 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setUniteChoisie(item)}
                  style={[styles.unite, item.code === uniteChoisie?.code && styles.uniteActive]}
                >
                  <Text style={item.code === uniteChoisie?.code ? styles.uniteTexteActif : styles.uniteTexte}>
                    {item.code}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          <View style={{ gap: 8, marginTop: 8 }}>
            {correspondanceExacte ? (
              <Bouton titre="Utiliser cet ingrédient" onPress={() => choisirExistant(correspondanceExacte)} />
            ) : (
              <Bouton
                titre="Créer ce nouvel ingrédient"
                onPress={creerNouveau}
                desactive={!validation.valide || !uniteChoisie}
              />
            )}
            <Bouton titre="Annuler" variante="contour" onPress={onFermer} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: 'rgba(36,28,21,0.35)', justifyContent: 'flex-end' },
  feuille: {
    backgroundColor: couleurs.fondEcran,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 12
  },
  titre: { fontSize: 20, fontWeight: '600', color: couleurs.encre, marginBottom: 4 },
  champ: {
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon.bouton,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: couleurs.encre
  },
  avisErreur: {
    backgroundColor: '#FBE9E2',
    borderRadius: rayon.carteCompacte,
    padding: 12
  },
  avisErreurTexte: { fontSize: 13, color: couleurs.primaireFonce, lineHeight: 18 },
  avisConnu: {
    backgroundColor: '#EAF3F1',
    borderRadius: rayon.carteCompacte,
    padding: 12
  },
  avisConnuTexte: { fontSize: 13, color: couleurs.encre, lineHeight: 18 },
  etiquette: { fontSize: 12, fontWeight: '600', color: couleurs.encreDouce },
  suggestion: {
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon.bouton,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  suggestionTexte: { fontSize: 14, color: couleurs.encre },
  ligneQuantite: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unite: {
    paddingHorizontal: 12,
    height: 48,
    borderRadius: rayon.pastille,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uniteActive: { backgroundColor: couleurs.primaire, borderColor: couleurs.primaire },
  uniteTexte: { fontSize: 13, color: couleurs.encre },
  uniteTexteActif: { fontSize: 13, color: couleurs.blanc, fontWeight: '600' }
});