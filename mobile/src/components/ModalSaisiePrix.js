import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { couleurs, rayon } from '../theme';
import { Bouton } from './Bouton';

// Saisie d'un PRIX_PERSONNALISE au fil des courses (document v5,
// paquet Prix et cout). Le prix saisi ne remplace pas le prix de
// reference : il vient par-dessus, et le champ sourcePrix garde la
// trace de celui qui a servi au calcul.
//
// La personne saisit ce qu'elle a paye POUR une quantite donnee
// (ex. 12,99 $ pour 500 g), pas un prix unitaire : personne ne lit
// "0,026 $ le gramme" sur une etiquette.
export function ModalSaisiePrix({ visible, ligne, onFermer, onEnregistrerPrix }) {
  const [prix, setPrix] = useState('');
  const [quantite, setQuantite] = useState('');
  const [magasin, setMagasin] = useState('');

  useEffect(() => {
    if (!visible || !ligne) return;
    setPrix('');
    // Pre-remplit avec la quantite de la liste : le cas le plus courant
    // est d'acheter exactement ce qui est demande.
    setQuantite(String(ligne.quantite));
    setMagasin('');
  }, [visible, ligne]);

  if (!ligne) return null;

  const prixNombre = Number(prix.replace(',', '.'));
  const quantiteNombre = Number(quantite.replace(',', '.'));
  const saisieValide = prixNombre > 0 && quantiteNombre > 0;

  function enregistrer() {
    if (!saisieValide) return;
    onEnregistrerPrix({ prix: prixNombre, quantite: quantiteNombre, magasin: magasin.trim() || null });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFermer}>
      <Pressable style={styles.fond} onPress={onFermer}>
        {/* Le Pressable interieur absorbe les appuis : toucher la feuille
            ne doit pas la fermer, seulement toucher le fond. */}
        <Pressable style={styles.feuille} onPress={() => {}}>
          <Text style={styles.titre}>{ligne.nom}</Text>
          <Text style={styles.sousTitre}>
            Prix payé, pour la quantité achetée. Il remplacera le prix de référence.
          </Text>

          <View style={styles.champs}>
            <View style={styles.champ}>
              <Text style={styles.libelle}>Prix payé ($)</Text>
              <TextInput
                value={prix}
                onChangeText={setPrix}
                keyboardType="decimal-pad"
                placeholder="12.99"
                style={styles.saisie}
              />
            </View>

            <View style={styles.champ}>
              <Text style={styles.libelle}>Pour ({ligne.codeUnite})</Text>
              <TextInput
                value={quantite}
                onChangeText={setQuantite}
                keyboardType="decimal-pad"
                placeholder="500"
                style={styles.saisie}
              />
            </View>
          </View>

          <View style={styles.champ}>
            <Text style={styles.libelle}>Magasin (facultatif)</Text>
            <TextInput value={magasin} onChangeText={setMagasin} placeholder="Adonis" style={styles.saisie} />
          </View>

          <Text style={styles.calcul}>
            {saisieValide
              ? `Soit ${(prixNombre / quantiteNombre).toFixed(4)} $ par ${ligne.codeUnite}.`
              : 'Entre un prix et une quantité supérieurs à zéro.'}
          </Text>

          <Bouton titre="Enregistrer ce prix" onPress={enregistrer} desactive={!saisieValide} />
          <Bouton titre="Annuler" variante="contour" onPress={onFermer} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  feuille: {
    backgroundColor: couleurs.blanc,
    borderTopLeftRadius: rayon.carte,
    borderTopRightRadius: rayon.carte,
    padding: 20,
    gap: 12
  },
  titre: { fontSize: 18, fontWeight: '700', color: couleurs.encre },
  sousTitre: { fontSize: 13, color: couleurs.encreDouce },
  champs: { flexDirection: 'row', gap: 12 },
  champ: { flex: 1, gap: 4 },
  libelle: { fontSize: 12, fontWeight: '600', color: couleurs.encreDouce },
  saisie: {
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: couleurs.encre,
    backgroundColor: couleurs.fondEcran
  },
  calcul: { fontSize: 12, color: couleurs.encreDouce, paddingVertical: 2 }
});