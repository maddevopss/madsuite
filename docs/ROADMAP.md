# Roadmap MADSuite

## Complété (état dépôt V5.2)

### Socle MVP

- [x] Auth (JWT cookies httpOnly, refresh rotation, sessions)
- [x] Dashboard (métriques, timer actif, billing cockpit)
- [x] Clients (CRUD, soft delete)
- [x] Projets (CRUD, budget, taux horaire, statuts)
- [x] Gestion du temps (timer, timesheet, entrées)
- [x] Multi-organisation (RLS PostgreSQL, settings rétention)
- [x] Permissions (rôles admin/employe, `requireRole`)

### Facturation

- [x] Factures CRUD (draft/sent/paid/void)
- [x] Numérotation par organisation
- [x] PDF basique (jsPDF backend + frontend)
- [x] Billing dashboard + billing assistant (feature-flagged)
- [x] Liaison time_entries → invoices

### Productivité

- [x] Rapports (mensuel/trimestriel, export CSV/PDF)
- [x] Desktop agent Electron (tracking fenêtres, activity logs)
- [x] Activity intelligence (règles classification, feature-flagged)
- [x] Project detection (feature-flagged)
- [x] Agrégation activity_logs (job cron)
- [x] Rétention configurable par organisation

### Infrastructure

- [x] Tests Jest (backend, frontend, desktop-agent)
- [x] 18 specs Playwright E2E
- [x] CI GitHub Actions
- [x] Docker Compose dev
- [x] Migrations SQL (001–029)
- [x] Email service (SMTP) + security incidents buffer

---

## En cours / Backlog MVP

### Sprint facturation avancée

- [ ] PDF professionnel (branding, taxes avancées)
- [ ] Soumissions / Estimates (table DB + CRUD + conversion → facture)
- [ ] Stripe intégration + webhooks
- [ ] Paiements en ligne

### Sprint go-to-market

- [ ] Landing page
- [ ] Marketing / onboarding payant
- [ ] Plans tarifaires (Free/Pro/Business — voir `BUSINESS.md`)

### Dette / stabilisation

- [ ] Intégrer ou supprimer `auth.controller.js` / `auth.routes.js` (WIP non monté)
- [ ] Harmoniser branding MADSuite → MADSuite dans le code
- [ ] Monter `securityBufferJob` dans scheduler si pas actif

---

## V2

- IA (OpenAI intégration — suggestions partielles existent)
- Rapports avancés / analytics
- Multi-utilisateurs avancé
- Mobile punch (`/mobilepunch` placeholder)
- Calcul km (`/calculkm` placeholder)

---

## V3

- CRM avancé
- Inventaire
- RH
- Gestion des dépenses

---

## Priorité Absolue

Tout ce qui aide à obtenir le premier client payant : **Soumissions → Stripe → Landing page**.
