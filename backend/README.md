# Serveur Sofra

Passerelle Spoonacular, comptes et fil de la communaute (Node.js + Express + MongoDB).

## Installation

```
cd backend
npm install
cp .env.example .env
```

Remplir `.env` avec ta cle Spoonacular et l'URL de ta base Mongo (locale ou Atlas).

## Demarrage

```
npm run dev
```

## Routes disponibles

- `POST /api/auth/inscription` — creer un compte
- `POST /api/auth/connexion` — se connecter, retourne un jeton
- `POST /api/plan/recettes` — body `{ carte, langue }`, retourne les recettes filtrees (aucune cle exposee au mobile)
- `GET /api/fil?page=1` — lire le fil de la communaute
- `POST /api/fil` — publier une recette (jeton requis dans `Authorization: Bearer ...`)

## A completer selon le document de conception

- Seed initial de `termeExclu` (porc, bacon, gelatine, vin, etc.) a inserer en base au demarrage.
- Validation plus stricte des entrees (ex. avec `zod` ou `express-validator`).
- Gestion d'erreurs specifique quand Spoonacular est lent au reveil (hebergement gratuit).
