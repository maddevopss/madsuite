# Documentation Maintenance Rules

Après chaque feature majeure :

1. Mettre à jour `docs/CHANGELOG_INTERNAL.md`
2. Mettre à jour `docs/ROADMAP.md` (déplacer items complétés)
3. Mettre à jour `docs/KNOWN_ISSUES.md`
4. Mettre à jour `docs/DECISIONS.md` si une décision a été prise
5. Vérifier `docs/SECURITY.md` si la feature touche l'auth ou les données
6. Synchroniser `docs/ARCHITECTURE.md` et `docs/DATABASE.md` avec le code
7. Mettre à jour `claude-context.md` et `AGENTS.md` si modules/workflow changent

## Fichiers à maintenir

| Fichier | Rôle |
|---------|------|
| `AGENTS.md` | Instructions IA, modules actifs, workflow |
| `claude-context.md` | Contexte condensé pour agents |
| `agent-loop.md` / `agent-hardmode.md` | Modes d'exécution autonome |
| `docs/MADSUITE_CONTEXT.md` | Vision produit + stack réelle |
| `docs/ARCHITECTURE.md` | Structure, APIs, services |
| `docs/DATABASE.md` | Schéma, multi-tenant, tables |
| `docs/SECURITY.md` | Auth, RLS, secrets |
| `docs/ROADMAP.md` | Backlog et complétés |
| `docs/CHANGELOG_INTERNAL.md` | Historique des changements |
| `docs/KNOWN_ISSUES.md` | Dette technique, bugs connus |
| `docs/DECISIONS.md` | Décisions architecturales |
| `docs/SESSION_NOTES.md` | Notes de session |
| `docs/AI_CTO.md` | Prompt CTO + fichiers à lire |
| `docs/BUSINESS.md` | Plan business (stable) |
| `docs/BACKLOG.md` | Priorités produit |
| `docs/KPI.md` | Métriques manuelles |

## Règles

- Lire avant de modifier
- Ne jamais supprimer d'info sauf si obsolète confirmé
- Préserver commentaires et notes manuelles
- Source de vérité = état du dépôt (pas la doc aspirational)
- Le `README.md` racine reste la doc technique MADSuite détaillée
