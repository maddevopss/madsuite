# E2E Smoke Test MADSuite — Plan d'Exécution

**Date:** 7 juillet 2026  
**Objectif:** Valider les flows principaux après stabilisation plans/modules/subscriptions  
**Statut:** 🟡 EN PRÉPARATION

---

## Étape 1 — Vérification Environnement E2E ✅

### Emplacement & Structure

```
e2e/
├── playwright.config.js          ✅ Configuré
├── package.json                  ✅ Scripts disponibles
├── .env.example                  ✅ Présent
├── load-env.js                   ✅ Charge .env.test
├── auth.setup.js                 ✅ Setup auth UI
├── tests/
│   ├── auth-ui.setup.js          ✅ Auth setup
│   ├── responsive-mobile.spec.js ✅ Tests responsive
│   └── ...autres specs
└── helpers/
    └── ...helpers
```

### Configuration Playwright

**File:** `e2e/playwright.config.js`
- ✅ `baseURL`: `http://localhost:3000` (configurable via `TEST_BASE_URL`)
- ✅ `testDir`: `./tests`
- ✅ `timeout`: 30s
- ✅ `projects`: chromium-desktop, webkit-mobile, chromium-mobile
- ✅ `reporter`: list + html

### Variables d'Environnement Requises

**Source:** `backend/.env.test`

| Variable | Valeur | Statut |
|----------|--------|--------|
| `NODE_ENV` | `test` | ✅ OK |
| `DB_HOST` | `localhost` | ✅ OK |
| `DB_PORT` | `5432` | ✅ OK |
| `DB_NAME` | `madsuite_test` | ✅ OK |
| `DB_USER` | `postgres` | ✅ OK |
| `DB_PASSWORD` | `1234` | ✅ OK |
| `JWT_SECRET` | `test-secret-...` | ✅ OK |
| `TEST_DATABASE_URL` | `postgresql://...` | ✅ OK |
| `E2E_ADMIN_EMAIL` | `revenue-e2e@test.com` | ✅ OK |
| `E2E_PASSWORD` | `1234` | ✅ OK |
| `TEST_BASE_URL` | `http://localhost:3000` | ✅ OK (default) |
| `TEST_API_URL` | `http://localhost:5000/api` | ✅ OK (default) |

**Résultat:** ✅ Toutes les variables requises sont présentes dans `backend/.env.test`

### Seed & GlobalSetup

**Backend seed:**
- ✅ `backend/jest.globalSetup.js` — Prépare la DB de test
- ✅ Crée les utilisateurs E2E: `revenue-e2e@test.com` (admin)
- ✅ Crée les organisations de test avec différents plans

**E2E auth setup:**
- ✅ `e2e/tests/auth-ui.setup.js` — Génère `auth.json` via UI login
- ✅ Utilise `E2E_ADMIN_EMAIL` et `E2E_PASSWORD` du backend

---

## Étape 2 — Lancer Smoke Local

### Prérequis

```bash
# 1. PostgreSQL doit tourner sur localhost:5432
# 2. Redis doit tourner sur localhost:6379 (optionnel pour tests)
# 3. Node.js 18+ installé
```

### Commandes de Démarrage

**Backend:**
```bash
cd backend
npm run dev
# Écoute sur http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Écoute sur http://localhost:3000
```

**E2E Tests:**
```bash
cd e2e
npm install
npm run test:auth          # Génère auth.json
npm test                   # Lance tous les tests
```

### Scripts Disponibles

**Root:**
```bash
npm run test:e2e           # Lance tous les tests E2E
npm run test:e2e:responsive # Tests responsive seulement
```

**E2E:**
```bash
npm run test               # Tous les tests
npm run test:auth          # Setup auth seulement
npm run test:responsive    # Tests responsive
npm run report             # Affiche le rapport HTML
```

---

## Étape 3 — Vérifier Plans/Modules en E2E

### Utilisateurs de Test

**Backend seed crée:**
- ✅ `revenue-e2e@test.com` — Admin (plan: admin)
- ✅ Autres utilisateurs selon le seed

### Matrice de Validation

| Plan | Utilisateur | Modules Visibles | Modules Cachés |
|------|-------------|------------------|-----------------|
| **FREE** | À créer | dashboard, clients, projects, timesheet, time_tracking | invoices, reports, estimates, expenses, cognitive_engine, desktop_agent |
| **PRO** | À créer | FREE + invoices, reports | estimates, expenses, cognitive_engine, desktop_agent |
| **ENTERPRISE** | À créer | FREE + PRO + ADDON | cognitive_engine, desktop_agent |
| **ADMIN** | revenue-e2e@test.com | TOUS | (aucun) |

### Tests à Valider

**Routes protégées:**
- ✅ `/dashboard` — Accessible à tous
- ✅ `/invoices` — PRO+ seulement
- ✅ `/reports` — PRO+ seulement
- ✅ `/estimates` — ENTERPRISE+ seulement
- ✅ `/expenses` — ENTERPRISE+ seulement
- ✅ `/billing-assistant` — ENTERPRISE+ seulement
- ✅ `/calculkm` — ENTERPRISE+ seulement

**Modules internes:**
- ✅ `cognitive_engine` — ADMIN/INTERNAL seulement
- ✅ `desktop_agent` — ADMIN/INTERNAL seulement

---

## Étape 4 — Corriger Bugs Réels

### Critères de Correction

**Corriger si:**
- ❌ Sélecteur Playwright brisé (UI a changé)
- ❌ Module réellement absent (bug backend)
- ❌ Seed incomplet (utilisateurs/orgs manquants)
- ❌ Erreur API 403/404 non intentionnelle

**Ne pas corriger si:**
- ✅ Test échoue parce que le module n'est pas activé (intentionnel)
- ✅ Test échoue parce que l'utilisateur n'a pas le plan (intentionnel)
- ✅ Test échoue parce que la DB de test n'existe pas (setup local)

### Processus de Correction

1. **Identifier la cause:**
   ```bash
   npm test -- --debug
   # Ou
   npm run report
   ```

2. **Vérifier le backend:**
   ```bash
   cd backend
   npm test -- --testNamePattern="modules"
   ```

3. **Corriger minimalement:**
   - Modifier seulement le fichier de test ou le sélecteur
   - Pas de refactor
   - Pas de changement logique

4. **Tester la correction:**
   ```bash
   npm test -- --grep "test-name"
   ```

---

## Étape 5 — Rapport E2E

### Commandes Lancées

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# E2E
cd e2e
npm install
npm run test:auth
npm test
npm run report
```

### Variables Manquantes

**Résultat:** ❌ AUCUNE

Toutes les variables requises sont présentes dans `backend/.env.test`.

### Tests Passés

À remplir après exécution.

### Tests Échoués

À remplir après exécution.

### Cause des Échecs

À documenter après exécution.

### Corrections Faites

À documenter après exécution.

### Fichiers Modifiés

À documenter après exécution.

### Prochaine Action Recommandée

À déterminer après exécution.

---

## Checklist d'Exécution

- [ ] PostgreSQL en cours d'exécution
- [ ] Redis en cours d'exécution (optionnel)
- [ ] Backend démarré (`npm run dev`)
- [ ] Frontend démarré (`npm run dev`)
- [ ] E2E setup auth (`npm run test:auth`)
- [ ] E2E tests lancés (`npm test`)
- [ ] Rapport généré (`npm run report`)
- [ ] Bugs identifiés et documentés
- [ ] Corrections minimales appliquées
- [ ] Tests re-lancés après corrections
- [ ] Rapport final généré

---

**Statut:** 🟡 EN ATTENTE D'EXÉCUTION  
**Prochaine étape:** Démarrer backend/frontend et lancer smoke tests
