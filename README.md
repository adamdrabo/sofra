# Sofra

Application mobile de planification de repas sur 7 jours, à partir de recettes sans porc ni alcool.

## Structure du projet

- `backend/` : serveur Node.js, Express et MongoDB. Il sert de passerelle vers Spoonacular (la clé reste côté serveur) et gère les comptes et le fil de la communauté.
- `mobile/` : application React Native avec Expo, en JavaScript. Les données de l'utilisateur sont stockées sur l'appareil avec AsyncStorage.

Chaque dossier a son propre README avec plus de détails.

## Prérequis

- Node.js 20 ou plus récent
- Un simulateur iOS, un émulateur Android, ou un téléphone avec l'application Expo Go

## Mise en route

### 1. Démarrer le serveur

```
cd backend
npm install
npm run dev
```

Le fichier `backend/.env` fourni contient déjà l'adresse de la base MongoDB Atlas et la clé Spoonacular. La base est en ligne et déjà remplie, il n'y a rien à installer ni à initialiser.

Le serveur est prêt quand le terminal affiche :

```
[db] Connecte a MongoDB (sofra)
[serveur] Sofra ecoute sur le port 3000
[serveur] Depuis le telephone : http://<adresse>:3000/api
```

### 2. Indiquer à l'application où se trouve le serveur

Ouvrir `mobile/src/config.js` et choisir l'adresse selon l'appareil utilisé :

| Appareil | Valeur de `API_BASE_URL` |
|---|---|
| Simulateur iOS | `http://localhost:3000/api` |
| Émulateur Android | `http://10.0.2.2:3000/api` |
| Téléphone avec Expo Go | l'adresse affichée par le serveur à la ligne `Depuis le telephone` |

Avec un téléphone, l'ordinateur et le téléphone doivent être sur le même wifi.

### 3. Démarrer l'application

Dans un deuxième terminal :

```
cd mobile
npm install
npx expo start
```

Appuyer sur `i` pour le simulateur iOS, sur `a` pour l'émulateur Android, ou scanner le code QR avec Expo Go.

## Parcours de test

1. Terminer l'accueil : langue, nombre de personnes, type de plan.
2. Dans l'onglet Semaine, appuyer sur le bouton pour générer le plan. La réponse prend quelques secondes.
3. Ouvrir une recette du plan pour voir ses ingrédients et ses étapes.
4. Parcourir les onglets Recettes, Liste, Communauté et Compte.

## En cas de problème

- **Le bouton de génération tourne sans fin :** l'application ne joint pas le serveur. Vérifier que le serveur tourne et que l'adresse dans `mobile/src/config.js` correspond à l'appareil utilisé (étape 2).
- **Message « nombre de plans disponibles atteint » :** le quota quotidien gratuit de Spoonacular est épuisé. Il se renouvelle à minuit UTC.
- **Le serveur s'arrête au démarrage :** le fichier `backend/.env` est absent ou incomplet.

## Tests

Depuis `backend` :

- `npm test` : tests unitaires, sans serveur ni base
- `npm run test:api` : collection Bruno, le serveur doit tourner

Voir `backend/tests/README.md` et `backend/bruno/README.md`.