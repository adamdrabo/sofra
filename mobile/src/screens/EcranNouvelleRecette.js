import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Bouton } from '../components/Bouton';
import { EnteteEcran } from '../components/EnteteEcran';
import { Carte } from '../components/Carte';
import { Puce } from '../components/Puce';
import { ModalNormalisationIngredient } from '../components/ModalNormalisationIngredient';
import { couleurs, rayon } from '../theme';
import { referentielsRepository } from '../repositories/referentielsRepository';
import { recetteRepository } from '../repositories/recetteRepository';

// Cas d'utilisation "Créer une recette" (et, via route.params.id,
// "Modifier"). Persiste vraiment dans le stockage local (AsyncStorage)
// via recetteRepository.
export function EcranNouvelleRecette({ route, navigation }) {
  const id = route.params?.id;

  const [chargement, setChargement] = useState(true);
  const [categories, setCategories] = useState([]);
  const [nomFr, setNomFr] = useState('');
  const [categorieId, setCategorieId] = useState(null);
  const [nombrePortions, setNombrePortions] = useState('4');
  const [tempsPreparation, setTempsPreparation] = useState('30');
  const [ingredients, setIngredients] = useState([]);
  const [etapes, setEtapes] = useState(['']);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      const [listeCategories, listeIngredientsConnus] = await Promise.all([
        referentielsRepository.listerCategories(),
        referentielsRepository.listerIngredients()
      ]);
      setCategories(listeCategories);
      setCategorieId((c) => c ?? listeCategories[0]?.id ?? null);

      if (id) {
        const recette = await recetteRepository.obtenirParId(id);
        if (recette) {
          setNomFr(recette.nomFr);
          setCategorieId(recette.categorieId);
          setNombrePortions(String(recette.nombrePortions));
          setTempsPreparation(String(recette.tempsPreparation));
          setIngredients(
            recette.ingredients.map((ing, index) => ({
              cle: `${ing.ingredientId}-${index}`,
              ingredientId: ing.ingredientId,
              nomFr: listeIngredientsConnus.find((i) => i.id === ing.ingredientId)?.nomFr ?? 'Ingrédient',
              quantite: ing.quantite,
              codeUnite: ing.codeUnite
            }))
          );
          setEtapes([...recette.etapes].sort((a, b) => a.ordre - b.ordre).map((e) => e.texteFr));
        }
      }
      setChargement(false);
    })();
  }, [id]);

  function ajouterIngredient(choix) {
    setIngredients((prec) => [
      ...prec,
      {
        cle: `${choix.ingredient.id}-${Date.now()}`,
        ingredientId: choix.ingredient.id,
        nomFr: choix.ingredient.nomFr,
        quantite: choix.quantite,
        codeUnite: choix.codeUnite
      }
    ]);
    setModalOuvert(false);
  }

  function retirerIngredient(cle) {
    setIngredients((prec) => prec.filter((i) => i.cle !== cle));
  }

  function modifierEtape(index, texte) {
    setEtapes((prec) => prec.map((e, i) => (i === index ? texte : e)));
  }

  function ajouterEtape() {
    setEtapes((prec) => [...prec, '']);
  }

  function retirerEtape(index) {
    setEtapes((prec) => prec.filter((_, i) => i !== index));
  }

  // Validation avant enregistrement. Elle est volontairement differente
  // de celle du nom d'ingredient : une etape contient normalement des
  // chiffres ("180 °C", "25 minutes"), on ne peut donc pas les
  // interdire. On exige plutot du vrai texte, ce qui suffit a rejeter
  // une saisie du genre "48203u-34-23".
  //
  // Renvoie un message d'erreur, ou null si tout est correct.
  function verifierSaisie() {
    const nom = nomFr.trim();
    if (nom.length < 2) return 'Donne un nom à ta recette.';
    if (!/\p{L}{2,}/u.test(nom)) return 'Le nom de la recette doit être écrit en lettres.';

    const portions = Number(nombrePortions);
    if (!Number.isInteger(portions) || portions < 1 || portions > 50) {
      return 'Le nombre de portions doit être un entier entre 1 et 50.';
    }

    const temps = Number(tempsPreparation);
    if (!Number.isInteger(temps) || temps < 0 || temps > 1440) {
      return 'Le temps de préparation doit être en minutes, au maximum 1440.';
    }

    if (ingredients.length === 0) return 'Ajoute au moins un ingrédient.';

    const etapesRemplies = etapes.map((e) => e.trim()).filter((e) => e.length > 0);
    if (etapesRemplies.length === 0) return 'Ajoute au moins une étape.';

    // Au moins trois lettres d'affilee quelque part dans l'etape.
    if (etapesRemplies.some((e) => !/\p{L}{3,}/u.test(e))) {
      return 'Chaque étape doit être écrite en toutes lettres.';
    }

    return null;
  }

  async function enregistrer() {
    if (!categorieId) {
      setErreur('Choisis une catégorie.');
      return;
    }

    const messageErreur = verifierSaisie();
    if (messageErreur) {
      setErreur(messageErreur);
      return;
    }
    setErreur(null);

    const donnees = {
      categorieId,
      nomFr: nomFr.trim(),
      nombrePortions: Number(nombrePortions),
      tempsPreparation: Number(tempsPreparation),
      ingredients: ingredients.map((i) => ({
        ingredientId: i.ingredientId,
        quantite: i.quantite,
        codeUnite: i.codeUnite
      })),
      etapes: etapes.map((e) => e.trim()).filter((e) => e.length > 0)
    };

    if (id) {
      await recetteRepository.modifier(id, donnees);
    } else {
      await recetteRepository.creer(donnees);
    }
    navigation.goBack();
  }

  if (chargement) return null;

  return (
    <View style={styles.ecran}>
      <EnteteEcran
        titre={id ? 'Modifier la recette' : 'Nouvelle recette'}
        sousTitre="Crée une recette à ta façon"
        onRetour={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: 60 }}>
      <View style={{ gap: 8 }}>
        <Text style={styles.etiquette}>Nom de la recette</Text>
        <TextInput value={nomFr} onChangeText={setNomFr} placeholder="Ex. Mafé de bœuf" style={styles.champ} />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={styles.etiquette}>Catégorie</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <Pressable key={c.id} onPress={() => setCategorieId(c.id)}>
              <Puce texte={`${c.emoji} ${c.nomFr}`} active={c.id === categorieId} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={styles.etiquette}>Portions</Text>
          <TextInput
            value={nombrePortions}
            onChangeText={setNombrePortions}
            keyboardType="number-pad"
            style={styles.champ}
          />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={styles.etiquette}>Temps (min)</Text>
          <TextInput
            value={tempsPreparation}
            onChangeText={setTempsPreparation}
            keyboardType="number-pad"
            style={styles.champ}
          />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.etiquette}>Ingrédients</Text>
        <Carte style={{ paddingVertical: 4 }}>
          {ingredients.length === 0 ? (
            <Text style={[styles.texteVide, { paddingVertical: 14 }]}>Aucun ingrédient ajouté.</Text>
          ) : null}
          {ingredients.map((ing, index) => (
            <View
              key={ing.cle}
              style={[styles.ligneIngredient, index < ingredients.length - 1 && styles.avecSeparateur]}
            >
              <Text style={styles.ingredientNom}>{ing.nomFr}</Text>
              <Text style={styles.ingredientQte}>
                {ing.quantite} {ing.codeUnite}
              </Text>
              <Pressable onPress={() => retirerIngredient(ing.cle)}>
                <Text style={styles.retirer}>Retirer</Text>
              </Pressable>
            </View>
          ))}
        </Carte>
        <Bouton titre="Ajouter un ingrédient" variante="contour" onPress={() => setModalOuvert(true)} />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.etiquette}>Étapes</Text>
        {etapes.map((texte, index) => (
          <View key={index} style={styles.ligneEtapeEdition}>
            <View style={styles.numeroEtape}>
              <Text style={styles.numeroEtapeTexte}>{index + 1}</Text>
            </View>
            <TextInput
              value={texte}
              onChangeText={(t) => modifierEtape(index, t)}
              placeholder="Décris cette étape"
              multiline
              style={[styles.champ, { flex: 1 }]}
            />
            {etapes.length > 1 ? (
              <Pressable onPress={() => retirerEtape(index)}>
                <Text style={styles.retirer}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        <Bouton titre="Ajouter une étape" variante="contour" onPress={ajouterEtape} />
      </View>

      {/* Message affiche seulement apres une tentative d'enregistrement :
          on ne reproche rien a quelqu'un qui est encore en train de taper. */}
      {erreur ? (
        <View style={styles.avisErreur}>
          <Text style={styles.avisErreurTexte}>{erreur}</Text>
        </View>
      ) : null}

      <Bouton titre="Enregistrer la recette" onPress={enregistrer} desactive={nomFr.trim().length === 0} />

      <ModalNormalisationIngredient
        visible={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        onConfirmer={ajouterIngredient}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  etiquette: { fontSize: 13, fontWeight: '600', color: couleurs.encreDouce },
  champ: {
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon.bouton,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 15,
    color: couleurs.encre
  },
  texteVide: { fontSize: 14, color: couleurs.encreDouce, textAlign: 'center' },
  avisErreur: { backgroundColor: '#FBE9E2', borderRadius: rayon.carteCompacte, padding: 12 },
  avisErreurTexte: { fontSize: 13, color: couleurs.primaireFonce, lineHeight: 18 },
  ligneIngredient: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  avecSeparateur: { borderBottomWidth: 1, borderColor: couleurs.separateur },
  ingredientNom: { flex: 1, fontSize: 15, color: couleurs.encre },
  ingredientQte: { fontSize: 13, color: couleurs.encreDouce },
  retirer: { fontSize: 13, color: couleurs.primaire, fontWeight: '600' },
  ligneEtapeEdition: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  numeroEtape: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: couleurs.primaire,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  numeroEtapeTexte: { fontSize: 13, fontWeight: '600', color: couleurs.primaire }
});