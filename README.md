# Sofra — structure de projet

Scaffold genere a partir du document de conception (cas d'utilisation v1, modele C4 v1, modele de donnees v5).

- `backend/` — serveur Node.js/Express/MongoDB : passerelle Spoonacular, comptes, fil de la communaute.
- `mobile/` — application React Native/Expo en JavaScript (App.js, screens/, components/, navigation React Navigation), testable directement dans Expo Go : stockage local clé-valeur (AsyncStorage), génération de plan, liste de courses, écrans.

Chaque dossier a son propre README avec les instructions d'installation et la liste de ce qui reste a coder.

## Ordre de mise en route suggere

1. Lancer le backend (`backend/README.md`) avec une base MongoDB locale ou Atlas et une cle Spoonacular.
2. Inserer manuellement quelques `termeExclu` dans MongoDB (porc, bacon, gelatine, vin...) pour que `/api/plan/recettes` renvoie des resultats deja filtres.
3. Lancer le mobile (`mobile/README.md`) en pointant `src/config.ts` vers le backend.
4. Tester le parcours : Configuration -> Obtenir un plan -> (liste de courses a completer) -> Compte -> Fil.
