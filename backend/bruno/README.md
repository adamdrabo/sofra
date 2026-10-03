# Tests d'API, collection Bruno

Vingt et une requêtes enregistrées contre le serveur Sofra, avec leurs
assertions. Elles couvrent les treize tests manuels du journal, plus les
cas d'erreur.

Bruno est un client d'API dont les requêtes sont des fichiers texte :
elles vivent dans le dépôt, à côté du code, et se relisent dans une revue
comme n'importe quel autre fichier.

## Lancer les tests

Le serveur doit tourner, et la base doit avoir été remplie avec
`npm run seed`.

Dans l'application Bruno : ouvrir ce dossier avec **Open Collection**,
choisir l'environnement **Local** en haut à droite, puis **Run** sur la
collection.

En ligne de commande, depuis `backend` :

```bash
npm run test:api
```

## Ce que les tests vérifient

| # | Requête | Ce qui est vérifié |
|---|---|---|
| 01 | Santé | serveur actif, base connectée, quota lisible |
| 02 | Plan Équilibré | 7 jours x 3 repas, seulement id/titre/image, aucun terme exclu dans les titres |
| 03 | Plan Rapide | assez de recettes pour ne rien répéter |
| 04 | Plan Riche en protéines | idem |
| 05 | Carte inconnue | 400, aucun point de quota consommé |
| 06 | Détail d'une recette | ingrédients et étapes présents, alerte d'exclusion vide, attribution de la source |
| 07 | Détail, identifiant invalide | 400 avant tout appel à l'API |
| 08 | Route inexistante | 404 en JSON, pas en HTML |
| 09 | Inscription | 201, mot de passe haché jamais renvoyé, courriel en minuscules |
| 10 | Courriel déjà pris | 409 |
| 11 | Mot de passe trop court | 400 |
| 12 | Connexion | 200, jeton en trois parties |
| 13 | Mauvais mot de passe | 401, message qui ne révèle pas si le courriel existe |
| 14 | Mon compte avec session | 200, bon compte |
| 15 | Mon compte sans session | 401 |
| 16 | Publier | 201, auteur pris dans le jeton, étapes renumérotées |
| 17 | Publier sans session | 401 |
| 18 | Publier sans ingrédient | 400 |
| 19 | Fil | lisible sans compte, tri chronologique, pagination |
| 20 | Lire une recette publiée | ingrédients et étapes, auteur sans donnée sensible |
| 21 | Identifiant invalide | 400 |

## Comment la collection s'enchaîne

Trois valeurs circulent d'une requête à l'autre, écrites par un script
de réponse et lues par les suivantes :

- `idRecetteExterne`, posé par la requête 02 et lu par la 06
- `courrielTest` et `jeton`, posés par la 09 et la 12, lus par les
  requêtes qui exigent une session
- `idRecettePubliee`, posé par la 16 et lu par les 19 et 20

Le courriel est généré avec l'horloge à chaque exécution, donc la
collection se relance sans vider la base entre deux passages.

## Si un test échoue

Trois échecs ne sont pas des bogues du code, mais de l'information :

- **02, le filtre** : un terme exclu a été trouvé dans un titre renvoyé
  par Spoonacular. C'est exactement le cas que la seconde vérification
  existe pour attraper. Le terme est à ajouter dans
  `scripts/seedTermesExclus.js`.
- **03 ou 04, `incomplet`** : la carte renvoie trop peu de recettes une
  fois le filtre appliqué. Les seuils se règlent dans
  `src/services/spoonacularService.js`.
- **06, `alerteExclusion`** : la recette tirée au sort contient un terme
  interdit dans ses ingrédients ou ses étapes. Même conclusion que 02.

Un échec en `QUOTA_EPUISE` veut dire que les points Spoonacular du jour
sont consommés. Ils se renouvellent à minuit UTC, soit 20 h à Montréal
en été et 19 h en hiver.
