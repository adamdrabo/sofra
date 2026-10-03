# Tests unitaires

Trente-neuf tests, aucune dépendance à installer : ils tournent avec le
lanceur intégré de Node. Aucun ne démarre le serveur, n'ouvre la base ni
n'appelle Spoonacular. Ils prennent moins de deux secondes.

```bash
npm test
```

## Ce qui est testé, et pourquoi

| Fichier | Ce qu'il couvre |
|---|---|
| `exclusion.test.js` | La recherche d'un terme interdit dans un texte. C'est la fonction qui porte la promesse du produit : une erreur ici ne se verrait pas à l'écran, elle laisserait passer un plat non conforme. |
| `erreurs.test.js` | La traduction de chaque erreur en réponse JSON. Si elle se casse, elle se casse pour toutes les routes à la fois. |
| `quota.test.js` | Le compteur de points Spoonacular : qu'il coupe au bon moment, et surtout qu'il ne coupe pas trop tôt. |
| `jwt.test.js` | Les jetons de session : identifiant retrouvé, secret vérifié, expiration respectée. |
| `cartes.test.js` | La table qui traduit une carte en paramètres d'appel. C'est la seule chose qui distingue les trois cartes. |

## Les cas qui comptent le plus

Trois tests valent d'être lus avant les autres, parce qu'ils décrivent
une décision de conception plutôt qu'un détail :

- **« graham » ne déclenche pas sur « ham »**, et « shampoo » non plus.
  La recherche se fait par mot entier. Sans cette règle, le terme
  « gin » retirerait toutes les recettes au gingembre.
- **Une erreur imprévue ne révèle rien.** Elle devient un 500 avec un
  message générique, jamais la pile d'appels, qui dirait à l'appelant
  comment le serveur est construit.
- **Le jeton ne contient que l'identifiant du compte.** Un JWT est
  signé, pas chiffré : n'importe qui peut le lire. C'est pour ça qu'on
  n'y met ni courriel ni nom.

## Ce que ces tests ne couvrent pas

Ils testent des fonctions isolées. Le comportement du serveur en marche,
avec sa base et l'API, est couvert par la collection Bruno, dans
`backend/bruno`.

L'application mobile n'a pas encore de tests unitaires : son code est en
modules ES et passe par Babel, ce que le lanceur de Node ne lit pas tel
quel. Il faudrait ajouter `jest-expo`.
