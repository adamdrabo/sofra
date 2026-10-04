# Sofra, serveur

Serveur Node.js, Express et MongoDB. Il a trois rôles :

- **Passerelle Spoonacular :** l'application mobile ne parle jamais à Spoonacular directement, la clé reste sur le serveur.
- **Comptes :** inscription, connexion et session par jeton.
- **Fil de la communauté :** publication et lecture des recettes partagées.

## Installation

```
cd backend
npm install
```

Node.js 20 ou plus récent est requis.

## Configuration

Le serveur lit ses réglages dans un fichier `.env` placé dans `backend/`. Ce fichier n'est pas dans le dépôt Git, car il contient des secrets.

```
MONGODB_URI=adresse de la base MongoDB (locale ou Atlas)
JWT_SECRET=chaîne secrète d'au moins 32 caractères
SPOONACULAR_KEY=clé de l'API Spoonacular
```

Ces trois variables sont obligatoires : s'il en manque une, le serveur s'arrête au démarrage en la nommant.

Variables facultatives :

| Variable | Valeur par défaut | Rôle |
|---|---|---|
| `PORT` | `3000` | port d'écoute |
| `JWT_EXPIRATION` | `7d` | durée de vie d'une session |
| `QUOTA_SEUIL_MIN` | `10` | nombre de points Spoonacular en dessous duquel le serveur cesse d'appeler l'API |

## Remplir la liste des termes exclus

```
npm run seed
```

Cette commande écrit dans la base la liste des ingrédients à exclure (porc et dérivés, alcool). Elle se lance une seule fois par base, et peut être relancée sans créer de doublons. Sans cette liste, la génération de plan répond par une erreur `FILTRE_INDISPONIBLE`.

## Démarrage

```
npm run dev
```

Le serveur est prêt quand le terminal affiche :

```
[db] Connecte a MongoDB (sofra)
[serveur] Sofra ecoute sur le port 3000
[serveur] Depuis le telephone : http://<adresse>:3000/api
```

Pour vérifier qu'il répond, ouvrir `http://localhost:3000/api/sante` dans un navigateur.

## Routes

| Méthode | Route | Session requise | Rôle |
|---|---|---|---|
| GET | `/api/sante` | non | état du serveur, de la base et du quota |
| GET | `/api/plan?carte=EQUILIBRE` | non | plan de 7 jours, 3 repas par jour |
| GET | `/api/plan/recettes/:id` | non | détail d'une recette : ingrédients et étapes |
| POST | `/api/auth/inscription` | non | créer un compte |
| POST | `/api/auth/connexion` | non | se connecter, retourne un jeton |
| GET | `/api/auth/moi` | oui | compte de la session en cours |
| GET | `/api/fil?page=1&limite=20` | non | fil de la communauté |
| GET | `/api/fil/:id` | non | une recette publiée |
| POST | `/api/fil` | oui | publier une recette |

Valeurs permises pour `carte` : `EQUILIBRE`, `RAPIDE`, `PROTEINES`.

Les routes avec session attendent l'en-tête `Authorization: Bearer <jeton>`.

Les erreurs sont toujours renvoyées en JSON, sous la même forme :

```json
{ "erreur": { "code": "CARTE_INVALIDE", "message": "..." } }
```

## Filtre sans porc ni alcool

Le filtre s'applique deux fois :

1. À la recherche : la liste des termes exclus est envoyée à Spoonacular, qui écarte les recettes contenant ces ingrédients.
2. À la réception : le serveur revérifie le titre de chaque recette et retire celles qui contiennent un terme exclu. Dans le détail d'une recette, les ingrédients et les étapes sont aussi vérifiés, et les termes trouvés sont signalés dans le champ `alerteExclusion`.

La recherche se fait par mot entier, pour que « ham » ne retire pas une recette contenant « graham ».

## Quota Spoonacular

Le forfait gratuit de Spoonacular donne un nombre limité de points par jour. Le serveur suit le quota restant à partir des réponses de l'API et cesse d'appeler Spoonacular quand il passe sous `QUOTA_SEUIL_MIN`. L'application reçoit alors l'erreur `QUOTA_EPUISE`. Le quota se renouvelle à minuit UTC.

## Organisation du code

- `src/server.js` : point d'entrée. Vérifie la configuration, branche les routes, démarre le serveur.
- `src/config/db.js` : connexion à MongoDB.
- `src/routes/` : adresses des routes.
- `src/controllers/` : traitement de chaque requête (plan, comptes, fil).
- `src/services/` : appels à Spoonacular, suivi du quota, filtre d'exclusion.
- `src/models/` : modèles Mongoose (`Compte`, `RecettePubliee`, `TermeExclu`).
- `src/middleware/` : vérification de la session et gestion des erreurs.
- `src/utils/jwt.js` : création et vérification des jetons.
- `scripts/seedTermesExclus.js` : remplissage de la liste des termes exclus.

## Tests

- `npm test` : tests unitaires. Ils tournent sans serveur, sans base et sans appel à Spoonacular. Voir `tests/README.md`.
- `npm run test:api` : collection Bruno, lancée contre le serveur en marche. Voir `bruno/README.md`.