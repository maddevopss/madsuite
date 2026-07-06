# Known Issues

Liste des problèmes connus.

---

## Critiques

Aucun actuellement.

---

## Élevés

### Documentation vs code

Statut : Résolu (2026-06-18)

Les docs `ARCHITECTURE.md` et `MADSUITE_CONTEXT.md` décrivaient Next.js/Prisma alors que le dépôt utilise React/Vite + Express + SQL brut. 18 fichiers synchronisés. Section "stack cible" conservée dans `ARCHITECTURE.md` comme futur uniquement.

### Auth controller WIP non intégré

Statut : Ouvert

Fichiers non trackés / non montés :

- `backend/src/controllers/auth.controller.js` — références `../config/db` (inexistant), colonnes `user_id` vs `utilisateur_id`
- `backend/src/routes/auth.routes.js` — non importé dans `app.js`

Auth active = `routes/login.js` + `services/auth.service.js`. Risque de confusion si quelqu'un monte le controller sans correction.

### Multi-tenant

Statut : Partiellement validé

- RLS PostgreSQL actif (migrations 019a–023)
- Test d'intégration : `rls-security.spec.js`
- Audit complet cross-module non terminé (invoices, activity, users)

---

## Moyens

### Facturation

Statut : Fonctionnel basique, à améliorer

Existant : CRUD, numérotation, PDF jsPDF basique, taxes simples.
Les soumissions et Stripe ont été ajoutés et sont fonctionnels.

Manque :

- PDF professionnel / branding avancé

### Branding incohérent

Statut : Résolu (Juin 2026)

Code et config harmonisés sous le nom unique de MADSuite :

- `DB_NAME=madsuite` par défaut
- Toutes les références dans le code et les variables d'environnement harmonisées
- Docs produit = MADSuite

### Architecture

Statut : À évaluer

- Duplication middleware RLS (`rlsContext.middleware.js` vs `organization.middleware.js`)
- `auth.controller.js` vs `auth.service.js` (deux chemins auth)
- Feature flags non-core désactivés en prod — modules Innovation/BillingAssistant invisibles

### Email / Redis optionnel

Statut : Dégradation gracieuse

Sans Redis/BullMQ, emails envoyés en synchrone. `bullmq`/`ioredis` non dans `backend/package.json` — import dynamique avec fallback.

---

## Faibles

### TypeScript

Pas de TypeScript dans le produit principal (JS CommonJS). Seul `madsuite-ai-panel/` est TypeScript. Pas un bug, mais doc aspirational mentionnait TS partout.

### Desktop agent dépendance native

`active-win` nécessite rebuild natif (`electron-rebuild`) sur certaines plateformes.

---

## Résolus (ne pas rouvrir sauf régression)

### Isolation activity rules (Juin 2026)

`activity_app_rules`, `activity_patterns`, `activity_context_rules` — `organisation_id NOT NULL` (019a/022).

### Sessions utilisateurs (Juin 2026)

`user_sessions.organisation_id` NOT NULL (020).

### JWT → cookies httpOnly (Juin 2026)

Web et desktop-agent utilisent cookies `access_token` / `refresh_token`.
