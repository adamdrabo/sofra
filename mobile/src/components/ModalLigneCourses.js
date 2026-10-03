import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { couleurs, rayon } from '../theme';
import { Bouton } from './Bouton';

export function ModalLigneCourses({ visible, ligne, unites, onFermer, onEnregistrer, onSupprimer }) {
  const [quantite, setQuantite] = useState('');
  const [uniteChoisie, setUniteChoisie] = useState(null);
  const [prix, setPrix] = useState('');
  const [quantitePrix, setQuantitePrix] = useState('');
  const [magasin, setMagasin] = useState('');

  const uniteCourante = useMemo(() => unites.find((u) => u.code === ligne?.codeUnite) ?? null, [unites, ligne]);

  const unitesCompatibles = useMemo(() => {
    if (!uniteCourante) return unites;
    return unites.filter((u) => u.codeUniteBase === uniteCourante.codeUniteBase);
  }, [unites, uniteCourante]);

  useEffect(() => {
    if (!visible || !ligne) return;
    setQuantite(String(ligne.quantite));
    setUniteChoisie(uniteCourante);
    setPrix('');
    setQuantitePrix(String(ligne.quantite));
    setMagasin('');
  }, [visible, ligne, uniteCourante]);

  if (!ligne) return null;

  const quantiteNombre = Number(quantite.replace(',', '.'));
  const quantiteValide = quantiteNombre > 0;

  const prixNombre = Number(prix.replace(',', '.'));
  const quantitePrixNombre = Number(quantitePrix.replace(',', '.'));
  const prixSaisi = prix.trim() !== '';
  const prixValide = prixNombre > 0 && quantitePrixNombre > 0;

  function enregistrer() {
    if (!quantiteValide || !uniteChoisie) return;
    if (prixSaisi && !prixValide) return;

    onEnregistrer({
      quantite: Math.round(quantiteNombre * 100) / 100,
      codeUnite: uniteChoisie.code,
      facteurVersBase: uniteChoisie.facteurVersBase,

      prix:
        prixSaisi && prixValide
          ? { prix: prixNombre, quantite: quantitePrixNombre, magasin: magasin.trim() || null }
          : null
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFermer}>
      <Pressable style={styles.fond} onPress={onFermer}>
        {/* Absorbe les appuis : toucher la feuille ne doit pas la fermer. */}
        <Pressable style={styles.feuille} onPress={() => {}}>
          <ScrollView contentContainerStyle={{ gap: 10 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.titre}>{ligne.nom}</Text>
            <Text style={styles.sousTitre}>
              {ligne.provenance === 'MANUELLE'
                ? 'Article ajouté à la main. Il est conservé quand tu régénères la liste.'
                : 'Article calculé depuis ton plan. Il sera recalculé à la prochaine génération.'}
            </Text>

            <Text style={styles.libelle}>Quantité à acheter</Text>
            <View style={styles.ligneChamps}>
              <TextInput
                value={quantite}
                onChangeText={setQuantite}
                keyboardType="decimal-pad"
                placeholderTextColor={couleurs.encreDouce}
                style={[styles.saisie, { flex: 1 }]}
              />
              <View style={styles.unites}>
                {unitesCompatibles.map((u) => (
                  <Pressable
                    key={u.code}
                    onPress={() => setUniteChoisie(u)}
                    style={[styles.unite, u.code === uniteChoisie?.code && styles.uniteActive]}
                  >
                    <Text style={u.code === uniteChoisie?.code ? styles.uniteTexteActif : styles.uniteTexte}>
                      {u.code}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text style={styles.libelle}>Prix payé (facultatif)</Text>
            <Text style={styles.aide}>
              Combien tu as payé, et pour quelle quantité. Exemple : 3,50 $ pour 4 {uniteChoisie?.code ?? 'unités'}.
            </Text>
            <View style={styles.ligneChamps}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.libelleChamp}>Montant payé ($)</Text>
                <TextInput
                  value={prix}
                  onChangeText={setPrix}
                  keyboardType="decimal-pad"
                  placeholder="3.50"
                  placeholderTextColor={couleurs.encreDouce}
                  style={styles.saisie}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.libelleChamp}>Pour combien de {uniteChoisie?.code ?? 'unités'}</Text>
                <TextInput
                  value={quantitePrix}
                  onChangeText={setQuantitePrix}
                  keyboardType="decimal-pad"
                  placeholder="4"
                  placeholderTextColor={couleurs.encreDouce}
                  style={styles.saisie}
                />
              </View>
            </View>

            <TextInput
              value={magasin}
              onChangeText={setMagasin}
              placeholder="Magasin, par exemple Adonis (facultatif)"
              placeholderTextColor={couleurs.encreDouce}
              style={styles.saisie}
            />

            {prixSaisi && prixValide ? (
              <Text style={styles.calcul}>
                Soit {(prixNombre / quantitePrixNombre).toFixed(2)} $ par {uniteChoisie?.code}. Ce prix remplacera le
                prix de référence pour cet ingrédient.
              </Text>
            ) : null}

            <View style={{ gap: 8, marginTop: 6 }}>
              <Bouton
                titre="Enregistrer"
                onPress={enregistrer}
                desactive={!quantiteValide || !uniteChoisie || (prixSaisi && !prixValide)}
              />
              <Bouton titre="Retirer de la liste" variante="contour" onPress={() => onSupprimer(ligne)} />
              <Bouton titre="Annuler" variante="contour" onPress={onFermer} />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
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
    maxHeight: '85%'
  },
  titre: { fontSize: 19, fontWeight: '700', color: couleurs.encre },
  sousTitre: { fontSize: 12, color: couleurs.encreDouce },
  libelle: { fontSize: 13, fontWeight: '700', color: couleurs.encre, marginTop: 8 },
  libelleChamp: { fontSize: 11, fontWeight: '600', color: couleurs.encreDouce },
  aide: { fontSize: 12, color: couleurs.encreDouce, marginBottom: 2 },
  ligneChamps: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  saisie: {
    backgroundColor: couleurs.blanc,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon.bouton,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: couleurs.encre
  },
  unites: { flexDirection: 'row', gap: 6 },
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
  uniteTexteActif: { fontSize: 13, color: couleurs.blanc, fontWeight: '600' },
  calcul: { fontSize: 12, color: couleurs.encreDouce }
});