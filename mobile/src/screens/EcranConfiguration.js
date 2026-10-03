import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { Bouton } from '../components/Bouton';
import { Carte } from '../components/Carte';
import { EnteteEcran } from '../components/EnteteEcran';
import { Puce } from '../components/Puce';
import { couleurs, espacement, rayon } from '../theme';

const CARTES = [
  { id: 'EQUILIBRE', label: '🥗 Équilibré' },
  { id: 'RAPIDE', label: '⚡ Rapide' },
  { id: 'PROTEINES', label: '🍗 Protéiné' }
];

const LANGUES = [
  { id: 'fr', label: '🇫🇷 Français' },
  { id: 'en', label: '🇬🇧 English' },
  { id: 'ar', label: '🇸🇦 العربية' }
];

export function EcranConfiguration({ navigation }) {
  const [nombrePersonnes, setNombrePersonnes] = useState(2);
  const [carte, setCarte] = useState('EQUILIBRE');
  const [langue, setLangue] = useState('fr');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    preferenceRepository.obtenir().then((preference) => {
      setNombrePersonnes(preference.nombrePersonnes);
      setCarte(preference.carte);
      setLangue(preference.langue);
      setChargement(false);
    });
  }, []);

  async function enregistrer() {
    await preferenceRepository.mettreAJour({ nombrePersonnes, carte, langue });
    navigation.goBack();
  }

  if (chargement) return null;

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <EnteteEcran
        titre="Préférences"
        sousTitre="Personnalise ton plan de repas selon tes goûts"
        onRetour={() => navigation.goBack()}
      />

      <Carte style={styles.carte}>
        <Text style={styles.libelle}>👥 Nombre de personnes</Text>
        <View style={styles.stepperLigne}>
          <Pressable
            onPress={() => setNombrePersonnes((n) => Math.max(1, n - 1))}
            style={styles.stepperBouton}
          >
            <Text style={styles.stepperTexte}>–</Text>
          </Pressable>

          <Text style={styles.stepperValeur}>{nombrePersonnes}</Text>

          <Pressable
            onPress={() => setNombrePersonnes((n) => Math.min(12, n + 1))}
            style={[styles.stepperBouton, styles.stepperBoutonPlein]}
          >
            <Text style={[styles.stepperTexte, styles.stepperTextePlein]}>+</Text>
          </Pressable>
        </View>
      </Carte>

      <Carte style={styles.carte}>
        <Text style={styles.libelle}>Type de carte</Text>
        <View style={styles.puceLigne}>
          {CARTES.map((c) => (
            <Pressable key={c.id} onPress={() => setCarte(c.id)}>
              <Puce texte={c.label} active={carte === c.id} />
            </Pressable>
          ))}
        </View>
      </Carte>

      <Carte style={styles.carte}>
        <Text style={styles.libelle}>Langue de l'application</Text>
        <View style={styles.puceLigne}>
          {LANGUES.map((l) => (
            <Pressable key={l.id} onPress={() => setLangue(l.id)}>
              <Puce texte={l.label} active={langue === l.id} />
            </Pressable>
          ))}
        </View>
      </Carte>

      <View style={styles.boutonConteneur}>
        <Bouton titre="Enregistrer" onPress={enregistrer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  contenu: { padding: espacement.md, gap: espacement.md, paddingBottom: espacement.xl },
  carte: { paddingVertical: espacement.lg, gap: espacement.sm },
  libelle: { fontSize: 14, fontWeight: '600', color: couleurs.encre },

  stepperLigne: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espacement.lg },
  stepperBouton: {
    width: 48,
    height: 48,
    borderRadius: rayon.pastille,
    borderWidth: 1,
    borderColor: couleurs.primaire,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperBoutonPlein: { backgroundColor: couleurs.primaire, borderWidth: 0 },
  stepperTexte: { fontSize: 22, fontWeight: '600', color: couleurs.primaire },
  stepperTextePlein: { color: couleurs.blanc },
  stepperValeur: { fontSize: 32, fontWeight: '700', color: couleurs.encre, minWidth: 40, textAlign: 'center' },

  puceLigne: { flexDirection: 'row', flexWrap: 'wrap', gap: espacement.xs },

  boutonConteneur: { marginTop: espacement.sm }
});
