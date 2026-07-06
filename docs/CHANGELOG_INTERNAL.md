# Changelog Interne

Ce document sert à suivre les évolutions importantes de MADSuite.

---

## 2026-06-18

### Branding

- Abandon du nom MADSuite comme marque principale.
- Adoption du nom MADSuite.

### Vision Produit

MADSuite devient une plateforme SaaS de gestion pour PME.

Modules ciblés :

- Clients
- Projets
- Temps
- Soumissions
- Factures
- Paiements
- IA

### Documentation

Création des documents :

- MADSUITE_CONTEXT.md
- ROADMAP.md
- DATABASE.md
- ARCHITECTURE.md
- BUSINESS.md

### Objectif

Premier objectif :

500$/mois MRR

25 clients × 20$/mois

---

## 2026-06-18 (sync documentation ↔ dépôt)

### Architecture réelle documentée

- Correction doc : stack actuelle = React/Vite + Express + PostgreSQL (pas Next.js/Prisma)
- Monorepo : `backend/`, `frontend/`, `desktop-agent/`, `madsuite-ai-panel/`

### Sécurité

- RLS PostgreSQL documenté (`app.current_organisation_id`)
- Auth cookies httpOnly + refresh rotation
- `security_incidents_buffer` (migrations 027/028) + email alerts
- Migration 029 : contrainte `organisation_id` sur utilisateurs actifs

### Modules confirmés en production code

- Invoices, Reports, Activity intelligence, Billing assistant
- Desktop agent Electron, 18 specs E2E Playwright
- Email service (nodemailer, BullMQ optionnel)

### Dette identifiée

- `auth.controller.js` / `auth.routes.js` : fichiers WIP non montés dans `app.js`
- Branding mixte MADSuite / MADSuite dans code et env vars
- Soumissions/Stripe : planifiés, non implémentés
