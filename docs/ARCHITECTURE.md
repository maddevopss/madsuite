# Architecture Technique

> Stack réelle du dépôt (V5.2). Les références Next.js/Prisma ci-dessous sont **cibles futures**, pas l'état actuel.

## Frontend (actuel)

- React 19 + Vite
- React Router 7
- Axios, React Hook Form, Zod
- CSS personnalisé (pas Tailwind)
- jsPDF (export factures/rapports côté client)

## Backend (actuel)

- Node.js + Express 5 (CommonJS)
- Services métier (`backend/src/services/`)
- Validators Zod (`backend/src/validators/`)
- PostgreSQL via `pg` (pas d'ORM)
- Migrations SQL (`backend/db/`)

## Desktop Agent

- Electron 33 (`desktop-agent/`)
- `active-win` pour scan fenêtres
- `electron-store` chiffré pour session
- Communication IPC sécurisée (Zod validation)

## Base de données

- PostgreSQL avec Row-Level Security (RLS)
- Snapshot: `backend/db/schema_current.sql`
- Migrations actives: `backend/db/migrations/`
- Historique: `backend/db/archive/migrations/`

## Services Externes

| Service | Statut |
|---------|--------|
| SMTP (nodemailer) | Implémenté (`email.service.js`) |
| BullMQ + Redis | Optionnel (file email) |
| Stripe | Planifié, non implémenté |
| OpenAI | Planifié |
| Resend | Non utilisé (SMTP direct) |

---

# Structure du dépôt

```
TimeMonitoring/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── db/
│   │   ├── schema_current.sql
│   │   ├── migrations/
│   │   └── archive/migrations/
│   └── src/
│       ├── app.js              # Montage Express
│       ├── routes/             # 20 route files
│       ├── services/           # 25 service files
│       ├── middleware/         # auth, RLS, roles, rate-limit
│       ├── jobs/               # cron: aggregation, retention, timers
│       ├── validators/
│       ├── controllers/        # WIP (auth.controller.js non monté)
│       └── test/
├── frontend/
│   └── src/
│       ├── pages/              # Dashboard, Clients, Projets, etc.
│       ├── api/                # authContext, api.jsx
│       ├── components/
│       └── routes/
├── desktop-agent/
│   ├── main.js
│   └── src/main/               # tracking, authSession, windowScanner
├── madsuite-ai-panel/          # Extension VS Code (dev tooling)
├── e2e/                        # 18 specs Playwright
└── docs/
```

---

# APIs REST (`/api/*`)

| Préfixe | Auth | Description |
|---------|------|-------------|
| `/api/login` | Public | Login, logout, refresh (cookies httpOnly) |
| `/api/health` | Public | Health check DB |
| `/api/timesheet` | JWT | Entrées de temps |
| `/api/clients` | JWT | CRUD clients |
| `/api/dashboard` | JWT | Métriques dashboard |
| `/api/projets` | JWT | CRUD projets |
| `/api/users` | JWT | Gestion utilisateurs |
| `/api/reports` | JWT | Rapports + export |
| `/api/timer` | JWT | Timer actif |
| `/api/activity` | JWT | Logs desktop (rate-limit spécialisé) |
| `/api/activity-intelligence` | JWT + flag | Règles classification |
| `/api/project-detection` | JWT + flag | Détection projet auto |
| `/api/day-summary` | JWT | Résumés quotidiens |
| `/api/billing-assistant` | JWT + flag | Suggestions facturation |
| `/api/invoices` | JWT | Factures CRUD + PDF |
| `/api/billing` | JWT | Dashboard facturation |
| `/api/organisation` | JWT + admin | Rétention, settings org |

Feature flag: `ENABLE_V1_NON_CORE_FEATURES` (désactivé en prod par défaut).

---

# Principe (actuel)

```
React UI / Electron
       ↓
Express Route → Middleware (auth, RLS, role)
       ↓
Service (logique métier)
       ↓
PostgreSQL (pg pool + RLS context)
```

La logique métier ne doit pas être dans les composants React.

---

# Extension VS Code (`madsuite-ai-panel/`)

Outil de développement interne, pas le produit SaaS.

- TypeScript, compile vers `dist/`
- Webview panel + command router
- Actions: `loop.ts`, `feature.ts`, `bugfix.ts`, `ci.ts`
- Commande: `madsuite.openPanel`

---

# Jobs planifiés (cron)

| Job | Fréquence | Rôle |
|-----|-----------|------|
| `aggregateActivityLogs` | Horaire | Agrège `activity_logs` |
| `checkLongRunningTimers` | 15 min | Alerte timers longs |
| `dataRetention` | Nuit | Purge logs selon politique org |
| `securityBufferJob` | — | Envoi alertes sécurité groupées |
| `weeklyReport` | Hebdo | Rapport hebdomadaire |

---

# Sécurité

Toutes les routes protégées doivent :

- vérifier l'utilisateur (JWT cookie ou Bearer)
- vérifier l'organisation (`requireOrganisation` middleware)
- établir le contexte RLS (`app.current_organisation_id`)
- valider les entrées (Zod)

---

# Stack cible (futur — non implémenté)

- Next.js, TypeScript, Tailwind, shadcn/ui
- Prisma ORM
- Stripe, OpenAI, Resend

---

# Dette Technique

Toujours privilégier :

- petits refactorings
- amélioration incrémentale

Éviter :

- réécriture complète
