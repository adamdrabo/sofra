import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Bouton } from '../components/Bouton';
import { EnteteEcran } from '../components/EnteteEcran';
import { Carte } from '../components/Carte';
import { couleurs, espacement, rayon } from '../theme';
import { clientSofra } from '../services/clientSofra';
import { sessionService } from '../services/sessionService';
import { useEspacementBarreOnglets } from '../hooks/useEspacementBarreOnglets';

const LONGUEUR_MIN_MOT_DE_PASSE = 8;

export function EcranCompte() {
  const espacementBarre = useEspacementBarreOnglets();
  const [compte, setCompte] = useState(null);
  const [mode, setMode] = useState('inscription');
  const [courriel, setCourriel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nomAffiche, setNomAffiche] = useState('');
  const [erreur, setErreur] = useState(null);
  const [enChargement, setEnChargement] = useState(false);

  const estConnexion = mode === 'connexion';

  useEffect(() => {
    sessionService.obtenirCompte().then(setCompte);
  }, []);

  function changerMode(nouveauMode) {
    setMode(nouveauMode);
    setErreur(null);
    setMotDePasse('');
  }

  function verifierChamps() {
    if (!estConnexion && nomAffiche.trim().length < 2) {
      return 'Entre un nom affiché d\'au moins 2 caractères.';
    }
    if (!courriel.trim()) {
      return 'Entre ton courriel.';
    }
    if (!motDePasse) {
      return 'Entre ton mot de passe.';
    }
    if (!estConnexion && motDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      return `Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`;
    }
    return null;
  }

  async function soumettre() {
    const probleme = verifierChamps();
    if (probleme) {
      setErreur(probleme);
      return;
    }

    setErreur(null);
    setEnChargement(true);
    try {
      const reponse = estConnexion
        ? await clientSofra.connexion(courriel.trim(), motDePasse)
        : await clientSofra.inscription(courriel.trim(), motDePasse, nomAffiche.trim(), 'fr');
      await sessionService.enregistrer(reponse.jeton, reponse.compte);
      setCompte(reponse.compte);
      setMotDePasse('');
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setEnChargement(false);
    }
  }

  async function deconnecter() {
    await sessionService.deconnecter();
    setCompte(null);
    changerMode('connexion');
  }

  if (compte) {
    return (
      <View style={styles.ecran}>
        <EnteteEcran titre="Mon compte" sousTitre="Ton espace personnel Sofra" />
        <View style={[styles.contenuCompte, { paddingBottom: espacementBarre }]}>
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
      <EnteteEcran
        titre="Mon compte"
        sousTitre={estConnexion ? 'Connecte-toi pour publier tes recettes' : 'Crée un compte pour publier tes recettes'}
      />
      <ScrollView
        contentContainerStyle={[styles.contenu, { paddingBottom: espacementBarre }]}
        keyboardShouldPersistTaps="handled"
      >
        <Carte style={styles.formulaire}>
          <View style={styles.introFormulaire}>
            <View style={styles.miniLogo}><Text style={styles.miniLogoTexte}>S</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formTitre}>{estConnexion ? 'Connexion' : 'Créer un compte'}</Text>
              <Text style={styles.formSousTitre}>
                {estConnexion ? 'Entre ton courriel et ton mot de passe.' : 'Quelques informations pour commencer.'}
              </Text>
            </View>
          </View>

          {erreur ? <View style={styles.erreur}><Text style={styles.erreurTexte}>{erreur}</Text></View> : null}

          <View style={styles.champs}>
            {estConnexion ? null : (
              <>
                <Text style={styles.etiquette}>Nom affiché</Text>
                <TextInput
                  placeholder="Ex. Rami"
                  placeholderTextColor={couleurs.placeholderPhoto}
                  value={nomAffiche}
                  onChangeText={setNomAffiche}
                  style={styles.champ}
                />
              </>
            )}

            <Text style={styles.etiquette}>Courriel</Text>
            <TextInput
              placeholder="ton@email.com"
              placeholderTextColor={couleurs.placeholderPhoto}
              value={courriel}
              onChangeText={setCourriel}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.champ}
            />

            <Text style={styles.etiquette}>Mot de passe</Text>
            <TextInput
              placeholder={estConnexion ? 'Ton mot de passe' : 'Au moins 8 caractères'}
              placeholderTextColor={couleurs.placeholderPhoto}
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry
              style={styles.champ}
            />
          </View>

          <Bouton
            titre={estConnexion ? 'Se connecter' : 'Créer mon compte'}
            onPress={soumettre}
            enChargement={enChargement}
          />
          <Bouton
            titre={estConnexion ? 'Créer un compte' : 'J\'ai déjà un compte'}
            variante="contour"
            onPress={() => changerMode(estConnexion ? 'inscription' : 'connexion')}
            desactive={enChargement}
          />
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