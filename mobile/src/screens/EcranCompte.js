import { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { clientSofra } from '../services/clientSofra';
import { sessionService } from '../services/sessionService';

// Ecran "Gerer son compte" : cree un compte ou se connecte. Un compte
// n'est necessaire que pour publier une recette.
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
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, marginBottom: 12 }}>Connecte en tant que {compte.nomAffiche}</Text>
        <Button title="Se deconnecter" onPress={deconnecter} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 16 }}>Compte</Text>
      {erreur ? <Text style={{ color: 'red', marginBottom: 12 }}>{erreur}</Text> : null}

      <TextInput
        placeholder="Nom affiche"
        value={nomAffiche}
        onChangeText={setNomAffiche}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Courriel"
        value={courriel}
        onChangeText={setCourriel}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Mot de passe"
        value={motDePasse}
        onChangeText={setMotDePasse}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
      />

      <Button title="Creer un compte" onPress={inscrire} />
      <View style={{ height: 8 }} />
      <Button title="Se connecter" onPress={seConnecter} />
    </View>
  );
}
