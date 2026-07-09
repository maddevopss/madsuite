# MADSuite

Repo historique / agrégateur du produit MADSuite.

MADSuite est un SaaS de gestion et d’assistance cognitive non médicale pour travailleurs autonomes et petites équipes : clients, projets, temps, facturation, estimés, modules et parcours de reprise opérationnelle.

## Source de vérité

La documentation officielle et les décisions structurantes vivent dans :

```text
bleeband/SYSTEME_MAD
```

Documents à consulter avant toute décision produit ou technique :

```text
MANIFEST.md
00-SYSTEME-MAD/ai-context.md
00-SYSTEME-MAD/ai-context-madsuite-madproof.md
00-SYSTEME-MAD/repos.md
04-ADR/
09-CHECKLISTS/
```

## Repos actifs

Les développements actifs sont séparés par responsabilité :

```text
maddevopss/madsuite-frontend   Application web React/Vite
maddevopss/madsuite-backend    API, sécurité, jobs, logique métier
maddevopss/desktop-agent       Agent desktop Electron
maddevopss/e2e                 Tests Playwright end-to-end
bleeband/SYSTEME_MAD           Gouvernance, standards, MADPROOF, décisions
```

## Statut de ce repo

Ce dépôt peut contenir de l’historique, des essais ou des éléments hérités de l’ancien nom ChronoMAD / TimeMonitoring.

Ne pas le traiter comme source unique du produit actuel sans vérifier :

1. `bleeband/SYSTEME_MAD` pour la gouvernance;
2. `maddevopss/madsuite-frontend` pour le frontend actif;
3. `maddevopss/madsuite-backend` pour le backend actif;
4. `maddevopss/desktop-agent` pour l’agent local;
5. `maddevopss/e2e` pour les tests end-to-end.

## Règles MADPROOF

MADSuite doit rester une assistance cognitive non médicale.

À éviter :

- diagnostic;
- promesse clinique;
- mesure d’état mental réel;
- caméra ou microphone par défaut;
- profilage externe;
- comparaison entre utilisateurs;
- score de normalité.

Formulation sûre :

```text
MADSuite ne remplace pas l’utilisateur. MADSuite lui redonne le fil.
```

## Installation locale

Ce repo ne doit pas être utilisé comme guide d’installation principal tant que son rôle exact n’est pas clarifié.

Pour travailler sur les composants actifs, utiliser les README des repos spécialisés :

```text
maddevopss/madsuite-frontend
maddevopss/madsuite-backend
maddevopss/desktop-agent
maddevopss/e2e
```

## Auteurs

Réalisé par Marc-André Dufour.

© 2026 — MAD DevOps.

## Licence

MIT, sauf indication contraire dans les repos spécialisés ou la documentation officielle.
