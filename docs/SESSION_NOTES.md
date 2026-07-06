# 2026-06-18

## Fait

- Création du module Estimate
- Correction bug Invoice
- Sync documentation ↔ état réel du dépôt (18 fichiers)
- Correction stack doc : React/Vite + Express + PostgreSQL (pas Next.js/Prisma)

## Décisions

- Utilisation de Stripe (planifié, non codé)
- Conserver stack actuelle, évolution incrémentale (DEC-002)

## TODO

- PDF professionnel avancé
- Multi-tenant audit complet
- Implémenter table + module Soumissions/Estimates
- Résoudre auth.controller.js WIP
- Harmoniser branding MADSuite → MADSuite

---

# 2026-06-18 (audit documentation)

## Constat repo

- Branch `V5.2`, version `2.0.0`
- 20 routes API, 25 services, migrations jusqu'à 029
- 18 specs E2E Playwright
- Modules feature-flagged : activity-intelligence, billing-assistant, project-detection

## Docs mises à jour

`AGENTS.md`, `claude-context.md`, `MAINTENANCE.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/SECURITY.md`, `docs/ROADMAP.md`, `docs/CHANGELOG_INTERNAL.md`, `docs/KNOWN_ISSUES.md`, `docs/DECISIONS.md`, `docs/BACKLOG.md`, `docs/MADSUITE_CONTEXT.md`
