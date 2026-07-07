# MADSuite Frontend

Frontend officiel de MADSuite.

Source de verite documentaire : `bleeband/SYSTEME_MAD`.

## Role

Ce depot contient l'application web MADSuite : navigation, tableaux de bord, clients, projets, temps, factures, reglages, modules et vues utilisateur.

Le frontend rend les donnees et orchestre les appels API. La logique metier sensible, les calculs multi-tenant et les decisions de securite doivent rester cote backend.

## Stack

- React
- Vite
- Jest
- Testing Library
- ESLint

## Commandes

```bash
npm install
npm run dev
npm run lint
npm test -- --watchAll=false
npm run build
```

## MADPROOF checks

Avant de pousser une correction frontend sensible, executer :

```bash
npm run guard:gitignore
npm run guard:hygiene
npm run guard:modules-api
npm run guard:modules-known-keys
npm run guard:app-module-routes
```

Validation complete locale :

```bash
npm run check:frontend
```

Les guards bloquent notamment :

- regles `.gitignore` critiques manquantes;
- fichiers `.env` reels, builds ou rapports generes suivis par Git;
- appels directs interdits a l'API modules;
- routes ou cles modules non alignees avec le contrat applicatif.

## Environnement

Ne jamais commiter de fichier `.env` reel. Utiliser `.env.example` comme reference sans secret.

## Statut

Actif. Priorite : garder les guards MADPROOF verts et maintenir la coherence modules frontend/backend.
