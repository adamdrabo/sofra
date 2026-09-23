import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Bouton } from '../components/Bouton';
import { EnteteEcran } from '../components/EnteteEcran';
import { Carte } from '../components/Carte';
import { couleurs, espacement, rayon } from '../theme';
import { clientSofra } from '../services/clientSofra';
import { sessionService } from '../services/sessionService';

export function EcranCompte() {
  const [compte, setCompte] = useState(null);
  const [courriel, setCourriel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nomAffiche, setNomAffiche] = useState('');
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    sessionService.obtenirCompte().then(setCompte);
  }, []);

  async function inscrire() {
    setErreur(null);
    try {
      const { jeton, compte: nouveauCompte } = await clientSofra.inscription(courriel, motDePasse, nomAffiche, 'fr');
      await sessionService.enregistrer(jeton, nouveauCompte);
      setCompte(nouveauCompte);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
    }
  }

  async function seConnecter() {
    setErreur(null);
    try {
      const { jeton, compte: compteConnecte } = await clientSofra.connexion(courriel, motDePasse);
      await sessionService.enregistrer(jeton, compteConnecte);
      setCompte(compteConnecte);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
    }
  }

  async function deconnecter() {
    await sessionService.deconnecter();
    setCompte(null);
  }

  if (compte) {
    return (
      <View style={styles.ecran}>
        <EnteteEcran titre="Mon compte" sousTitre="Ton espace personnel Sofra" />
        <View style={styles.contenuCompte}>
          <Carte style={styles.profilCarte}>
            <View style={styles.avatar}><Text style={styles.avatarTexte}>{(compte.nomAffiche || 'S').charAt(0).toUpperCase()}</Text></View>
            <Text style={styles.bienvenue}>Bienvenue, {compte.nomAffiche}</Text>
            <Text style={styles.sousTexte}>Ton compte est connecté.</Text>
          </Carte>
          <Bouton titre="Se déconnecter" variante="contour" onPress={deconnecter} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.ecran} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <EnteteEcran titre="Mon compte" sousTitre="Connecte-toi pour retrouver tes informations" />
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Carte style={styles.formulaire}>
          <View style={styles.introFormulaire}>
            <View style={styles.miniLogo}><Text style={styles.miniLogoTexte}>S</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formTitre}>Bienvenue sur Sofra</Text>
              <Text style={styles.formSousTitre}>Crée ton compte ou connecte-toi.</Text>
            </View>
          </View>

          {erreur ? <View style={styles.erreur}><Text style={styles.erreurTexte}>{erreur}</Text></View> : null}

          <View style={styles.champs}>
            <Text style={styles.etiquette}>Nom affiché</Text>
            <TextInput
              placeholder="Ex. Rami"
              placeholderTextColor={couleurs.placeholderPhoto}
              value={nomAffiche}
              onChangeText={setNomAffiche}
              style={styles.champ}
            />

            <Text style={styles.etiquette}>Courriel</Text>
            <TextInput
              placeholder="ton@email.com"
              placeholderTextColor={couleurs.placeholderPhoto}
              value={courriel}
              onChangeText={setCourriel}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.champ}
            />

            <Text style={styles.etiquette}>Mot de passe</Text>
            <TextInput
              placeholder="Ton mot de passe"
              placeholderTextColor={couleurs.placeholderPhoto}
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry
              style={styles.champ}
            />
          </View>

          <Bouton titre="Créer mon compte" onPress={inscrire} />
          <Bouton titre="J'ai déjà un compte" variante="contour" onPress={seConnecter} />
        </Carte>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fondEcran },
  contenu: { padding: espacement.md, paddingBottom: 30 },
  contenuCompte: { padding: espacement.md, gap: 14 },
  formulaire: { padding: 18, gap: 16 },
  introFormulaire: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniLogo: { width: 48, height: 48, borderRadius: 16, backgroundColor: couleurs.fondDegrade, borderWidth: 1, borderColor: couleurs.bordure, alignItems: 'center', justifyContent: 'center' },
  miniLogoTexte: { fontSize: 25, fontWeight: '800', color: couleurs.primaire },
  formTitre: { fontSize: 18, fontWeight: '700', color: couleurs.encre },
  formSousTitre: { fontSize: 13, color: couleurs.encreDouce, marginTop: 2 },
  champs: { gap: 8 },
  etiquette: { fontSize: 13, fontWeight: '700', color: couleurs.encreDouce, marginTop: 2 },
  champ: { height: 52, borderRadius: rayon.bouton, borderWidth: 1, borderColor: couleurs.bordure, backgroundColor: couleurs.fondEcran, paddingHorizontal: 16, color: couleurs.encre, fontSize: 15 },
  erreur: { padding: 11, borderRadius: 12, backgroundColor: '#FBE9E2' },
  erreurTexte: { color: couleurs.primaireFonce, fontSize: 13 },
  profilCarte: { alignItems: 'center', paddingVertical: 28 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: couleurs.primaire, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarTexte: { color: couleurs.blanc, fontSize: 28, fontWeight: '800' },
  bienvenue: { fontSize: 20, fontWeight: '700', color: couleurs.encre },
  sousTexte: { marginTop: 4, fontSize: 13, color: couleurs.encreDouce }
});
