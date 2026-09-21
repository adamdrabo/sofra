# Sofra — application mobile

React Native + Expo + **React Navigation** (Stack + Bottom Tabs), en
JavaScript — même structure que tes anciens projets (`App.js`,
`components/`, `screens/`). Testable directement dans **Expo Go** :
stockage local en clé-valeur (`AsyncStorage`), aucun module natif
personnalisé.

## Installation

```
cd mobile
npm install
```

Modifie `src/config.js` avec l'adresse IP locale de ton serveur backend
(dossier `../backend`) si tu testes sur un téléphone physique avec Expo
Go — `localhost` ne fonctionne que dans un simulateur sur le même
ordinateur.

## Démarrage

```
npx expo start
```

Scanne le QR code avec l'app **Expo Go**. Si Expo Go annonce une
version de SDK différente de celle du projet, lance
`npx expo install --fix` pour réaligner les versions des paquets.

## Organisation du code

- `App.js` — point d'entrée : ensemence le stockage local puis affiche `AppNavigator`.
- `src/navigation/AppNavigator.js` — pile principale (Stack) : les onglets, plus Configuration, Fiche recette et Nouvelle/Modifier recette par-dessus.
- `src/navigation/TabsNavigator.js` — barre du bas (Bottom Tabs) : Semaine, Recettes, Liste, Communauté, Compte.
- `src/screens/` — un fichier par écran, chacun reçoit `navigation` (et `route` si l'écran a des paramètres) comme dans tes devoirs précédents.
- `src/components/` — composants partagés (`Bouton`, `Carte`, `Puce`, `EnteteEcran`, `ModalNormalisationIngredient`), style repris du prototype visuel (`src/theme.js`).
- `src/db/storage.js` — unique porte d'entrée vers AsyncStorage (lire/écrire par clé). `src/db/seed.js` écrit les données de départ (provenance SEED) au premier lancement.
- `src/repositories/` — une porte d'entrée par paquet du modèle (préférences, référentiels, recettes, plan, prix, liste de courses, favoris). Toutes les fonctions sont asynchrones (`await`).
- `src/services/` — logique qui ne touche pas au stockage : appel au serveur (`clientSofra.js`), session (`sessionService.js`), normalisation des noms d'ingrédients, calcul de coût, génération du plan.

## Navigation : comment on passe d'un écran à l'autre

Comme dans le devoir Navigation (Drawer/Tabs/Stack imbriqués) :

```js
// Aller vers un écran avec un paramètre
navigation.navigate('FicheRecette', { id: recette.id });

// Lire le paramètre dans l'écran de destination
export function EcranFicheRecette({ route, navigation }) {
  const { id } = route.params;
  ...
}

// Revenir en arrière (ex. après avoir enregistré un formulaire)
navigation.goBack();
```

## Stockage local : clé-valeur, pas SQLite

Le document de conception v5 a remplacé la base SQLite relationnelle
par un stockage clé-valeur simple. Une recette porte directement ses
ingrédients et ses étapes (imbriqués dans le même objet JSON) plutôt
que d'être éclatée en plusieurs tables jointes. Les règles qu'une base
relationnelle aurait imposées (unicité de `nomNormalise`, un seul prix
personnalisé par jour, etc.) sont vérifiées dans le code des
repositories — voir les commentaires dans `src/repositories/`.

## Écrans "Gestion des recettes" et "Normalisation"

Branchés sur le vrai stockage local :

- `src/screens/EcranRecettes.js` — liste "Mes recettes", ensemencée avec deux recettes d'exemple.
- `src/screens/EcranFicheRecette.js` — fiche recette.
- `src/screens/EcranNouvelleRecette.js` — création **et** modification (`route.params.id`), avec ingrédients et étapes ajoutables/supprimables. "Enregistrer" persiste vraiment via `recetteRepository`.
- `src/components/ModalNormalisationIngredient.js` — composant "Normalisation" : compare le nom tapé aux ingrédients déjà connus via `normaliserNom()` et propose de réutiliser l'existant plutôt que de créer un doublon ; sinon, crée le nouvel ingrédient via `referentielsRepository.trouverOuCreerIngredient()`.

## Ce qui reste à compléter

1. **Génération de la liste de courses** — l'agrégation par ingrédient et unité de base (normalisation + `coutService.obtenirPrixRetenu`) doit être écrite, puis passée à `coursesRepository.creerListe()`.
2. **Adapter une recette de la communauté** — copier les ingrédients d'une recette publiée dans `recetteRepository.creer()`, en résolvant chaque ingrédient via `referentielsRepository.trouverOuCreerIngredient()`.
3. **Écran de publication** — formulaire qui appelle `clientSofra.publierRecette()`.
4. **Favoris** — `favoriRepository` est prêt, pas encore branché à un écran.
5. **Multilingue (fr/en/ar)** — actuellement seul le français est saisi/affiché.
6. **Police Rubik** — installer `@expo-google-fonts/rubik` et la charger dans `App.js` pour un rendu identique au prototype (l'app retombe sur la police système en attendant).

## Répartition possible entre les 3 membres de l'équipe

- **Personne A** — backend complet (auth, passerelle Spoonacular, fil).
- **Personne B** — plan de la semaine + génération de liste + calcul de coût (point 1).
- **Personne C** — publication, favoris, multilingue (points 2 à 5).
