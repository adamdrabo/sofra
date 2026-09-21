import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { clientSofra } from '../services/clientSofra';

// Ecran "Fil de la communaute" : chronologique, sans tri ni popularite
// (decision de produit). Lecture ouverte, sans compte requis.
export function EcranFil() {
  const [recettes, setRecettes] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    clientSofra
      .consulterFil(1)
      .then((reponse) => setRecettes(reponse.recettes))
      .catch((e) => setErreur(e instanceof Error ? e.message : 'Erreur inconnue'));
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 12 }}>Fil de la communaute</Text>
      {erreur ? <Text style={{ color: 'red' }}>{erreur}</Text> : null}
      <FlatList
        data={recettes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '600' }}>{item.titre.fr}</Text>
            <Text>Par {item.auteurId.nomAffiche} — {item.tempsPreparation} min</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Aucune recette publiee pour le moment.</Text>}
      />
    </View>
  );
}
