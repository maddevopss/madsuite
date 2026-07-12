# MADSuite Frontend

Frontend officiel de MADSuite.

Source de vérité documentaire : `bleeband/SYSTEME_MAD`.

Avant toute décision structurante, consulter les documents officiels à la racine du dépôt `bleeband/SYSTEME_MAD` :

```text
MANIFEST.md
00-SYSTEME-MAD/ai-context.md
00-SYSTEME-MAD/ai-context-madsuite-madproof.md
00-SYSTEME-MAD/repos.md
03-STANDARDS/
04-ADR/
09-CHECKLISTS/
```

## Rôle

Ce dépôt contient l’application web MADSuite : navigation, tableaux de bord, clients, projets, temps, factures, réglages, modules et vues utilisateur.

Le frontend rend les données et orchestre les appels API. La logique métier sensible, les calculs multi-tenant et les décisions de sécurité doivent rester côté backend.

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

Avant de pousser une correction frontend sensible, exécuter :

```bash
npm run guard:gitignore
npm run guard:hygiene
npm run guard:modules-api
npm run guard:modules-known-keys
npm run guard:app-module-routes
```

Validation complète locale :

```bash
npm run check:frontend
```

Les guards bloquent notamment :

- règles `.gitignore` critiques manquantes;
- fichiers d’environnement réels, builds ou rapports générés suivis par Git;
- appels directs interdits à l’API modules;
- routes ou clés modules non alignées avec le contrat applicatif.

## Environnement

Ne jamais commiter de fichier d’environnement réel. Utiliser l’exemple fourni comme référence sans valeur sensible.

## Statut

Actif. Priorité : garder les guards MADPROOF verts et maintenir la cohérence modules frontend/backend.
