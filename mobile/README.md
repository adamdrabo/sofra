# Sofra, application mobile

Application React Native avec Expo, en JavaScript. Elle se teste directement dans Expo Go : aucun module natif personnalisé.

## Installation

```
cd mobile
npm install
```

## Adresse du serveur

L'application a besoin du serveur (dossier `../backend`) pour générer le plan, se connecter et lire le fil de la communauté. L'adresse se règle dans `src/config.js` :

| Appareil | Valeur de `API_BASE_URL` |
|---|---|
| Simulateur iOS | `http://localhost:3000/api` |
| Émulateur Android | `http://10.0.2.2:3000/api` |
| Téléphone avec Expo Go | l'adresse affichée par le serveur à la ligne `Depuis le telephone` |

Avec un téléphone, l'ordinateur et le téléphone doivent être sur le même wifi.

## Démarrage

```
npx expo start
```

Appuyer sur `i` pour le simulateur iOS, sur `a` pour l'émulateur Android, ou scanner le code QR avec Expo Go.

Si Expo Go annonce une version de SDK différente de celle du projet (SDK 57), lancer `npx expo install --fix` pour réaligner les versions des paquets.

## Fonctionnalités

- **Accueil au premier lancement :** nombre de personnes, type de plan (Équilibré, Rapide à cuisiner, Riche en protéines), langue.
- **Semaine :** génération d'un plan de 7 jours (déjeuner, dîner, souper) à partir de recettes sans porc ni alcool, fiche détaillée de chaque recette, remplacement d'un repas par une de ses propres recettes.
- **Recettes :** création et modification de recettes personnelles, avec ingrédients et étapes. Un contrôle évite de créer deux fois le même ingrédient sous des noms proches.
- **Liste :** liste d'épicerie calculée à partir du plan, avec les quantités regroupées par ingrédient et une estimation du coût.
- **Communauté :** fil des recettes publiées, lisible sans compte. Une recette publiée peut être copiée dans ses propres recettes.
- **Compte :** inscription et connexion. Un compte est requis seulement pour publier une recette.

## Organisation du code

- `App.js` : point d'entrée. Remplit le stockage local au premier lancement, puis affiche la navigation.
- `src/navigation/AppNavigator.js` : pile principale (accueil, onglets, fiches recette, formulaires).
- `src/navigation/TabsNavigator.js` : barre d'onglets du bas (Semaine, Recettes, Liste, Communauté, Compte).
- `src/screens/` : un fichier par écran.
- `src/components/` : composants partagés (`Bouton`, `Carte`, `Puce`, `EnteteEcran`, fenêtres modales).
- `src/db/storage.js` : seul accès à AsyncStorage (lire et écrire par clé). `src/db/seed.js` écrit les données de départ.
- `src/repositories/` : un fichier par type de donnée (préférences, recettes, plan, prix, liste de courses, favoris).
- `src/services/` : logique sans stockage direct. Appels au serveur (`clientSofra.js`), session (`sessionService.js`), génération du plan, liste de courses, calcul de coût, normalisation des ingrédients.
- `src/config.js` : adresse du serveur.
- `src/theme.js` : couleurs et styles communs.

## Stockage local

Les données de l'utilisateur restent sur l'appareil, dans un stockage clé-valeur (AsyncStorage). Une recette contient directement ses ingrédients et ses étapes dans le même objet JSON. Les règles de cohérence (un ingrédient unique par nom normalisé, par exemple) sont vérifiées dans le code des repositories.

Le jeton de session est conservé à part, dans le stockage sécurisé de l'appareil (`expo-secure-store`).

## Limites connues

- La liste d'épicerie et le coût sont calculés seulement pour les recettes créées par l'utilisateur. Les recettes venant de Spoonacular ne sont pas chiffrées, à cause des conditions d'utilisation de cette API.
- L'interface est en français. Le choix de langue est enregistré, mais les écrans ne sont pas encore traduits.
- Les favoris sont prêts côté données, mais pas encore reliés à un écran.
- L'application n'a pas de tests unitaires. Les tests du projet sont dans `../backend`.