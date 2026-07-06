# Phase 5 — Responsive Nightly Extended

## Vue d'ensemble

La Phase 5 ajoute une validation responsive étendue nightly pour MADSuite, complétant les phases précédentes :

- **Phase 1/P0** : Correction responsive mobile critique
- **Phase 2/P1** : Stabilisation UX mobile
- **Phase 3** : Tests Playwright anti-régression responsive
- **Phase 4** : CI Responsive Gate rapide sur Chromium
- **Phase 5** : Nightly Extended multi-navigateurs (Chromium, Firefox, WebKit)

## Architecture

### Workflow Nightly

**Fichier** : `.github/workflows/responsive-nightly.yml`

**Déclenchement** :
- Automatique : chaque nuit à **7h UTC** (2h du matin EST)
- Manuel : `workflow_dispatch` (bouton dans GitHub Actions)

**Durée** : ~45 minutes (timeout)

### Navigateurs couverts

| Navigateur | Objectif | Notes |
|-----------|----------|-------|
| **Chromium** | Baseline (Chrome/Edge) | Rapide, stable |
| **Firefox** | Détection bugs Firefox | Moteur Gecko |
| **WebKit** | Détection bugs Safari | Moteur WebKit |

### Environnement

Le workflow nightly utilise :

- **PostgreSQL 16** (service Docker)
- **Node.js 22**
- **Playwright 1.60+**
- **Backend** : `npm run start:test` (port 5000)
- **Frontend** : `npm run dev` (port 3000)

### Étapes du workflow

1. **Checkout** du code
2. **Setup Node.js** avec cache npm
3. **Installation** des dépendances (root, backend, frontend)
4. **Installation** des navigateurs Playwright (chromium, firefox, webkit)
5. **Démarrage** du backend en mode test
6. **Attente** du backend (health check sur `/health`)
7. **Démarrage** du frontend en mode dev
8. **Attente** du frontend (curl sur `http://localhost:3000`)
9. **Tests responsive** sur Chromium
10. **Tests responsive** sur Firefox
11. **Tests responsive** sur WebKit
12. **Upload** des artifacts (rapports, traces, résultats)

## Commandes locales

### Exécuter les tests responsive localement

```bash
# Chromium seulement (rapide, pour PR gate)
npm run test:e2e:responsive

# Multi-navigateurs (comme le nightly)
npx playwright test e2e/responsive-mobile.spec.js --project=chromium --project=firefox --project=webkit

# Chromium + Firefox (sans WebKit si instable)
npx playwright test e2e/responsive-mobile.spec.js --project=chromium --project=firefox

# Un seul navigateur
npx playwright test e2e/responsive-mobile.spec.js --project=firefox
```

## Différences : PR Gate vs Nightly

### PR Gate (Chromium seulement)

- **Quand** : À chaque push/PR sur les branches principales
- **Navigateur** : Chromium uniquement
- **Durée** : ~5-10 minutes
- **Bloquant** : OUI (doit passer pour merger)
- **Commande** : `npm run test:e2e:responsive`
- **Objectif** : Validation rapide, pas de régression mobile

### Nightly Extended (Multi-navigateurs)

- **Quand** : Chaque nuit à 7h UTC + manuel
- **Navigateurs** : Chromium, Firefox, WebKit
- **Durée** : ~45 minutes
- **Bloquant** : NON (informatif, ne bloque pas les PR)
- **Commande** : Workflow GitHub Actions
- **Objectif** : Détection bugs navigateur, cross-browser validation

## Artifacts et rapports

### En cas de succès

- Rapport HTML Playwright (optionnel, stocké 14 jours)

### En cas d'échec

- **Rapport HTML** : `playwright-report/`
- **Résultats bruts** : `test-results/`
- **Traces** : `test-results/` (vidéos, screenshots, traces)
- **Rétention** : 14 jours (rapports), 7 jours (traces)

### Accès aux artifacts

1. Aller sur GitHub Actions
2. Sélectionner le workflow `Responsive Nightly Extended`
3. Cliquer sur la run
4. Télécharger les artifacts

## Configuration Playwright

### Projets disponibles

Dans `playwright.config.js` :

```javascript
projects: [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  // Firefox et WebKit désactivés par défaut pour les tests rapides
  // Utiliser: npx playwright test --project=firefox --project=webkit
]
```

Le nightly utilise `--project=chromium --project=firefox --project=webkit` pour activer tous les navigateurs.

## Gestion des dépendances

### Playwright

- Version : `^1.60.0`
- Navigateurs : Installés via `npx playwright install --with-deps`
- Dépendances système : Incluses avec `--with-deps`

### Backend

- Démarrage : `npm run start:test` (mode test, port 5000)
- Base de données : PostgreSQL 16 (service CI)
- Env : `.env.test` (chargé automatiquement)

### Frontend

- Démarrage : `npm run dev` (Vite dev server, port 3000)
- Env : `VITE_API_URL=http://localhost:5000`

## Politique WebKit

### Statut actuel

WebKit est **inclus** dans le nightly pour détecter les problèmes proches de Safari.

### Si WebKit devient instable

1. **Documenter** le problème (flakiness, timeouts)
2. **Séparer** WebKit dans un job non-bloquant (optionnel)
3. **Ne jamais** rendre WebKit obligatoire sur le PR gate rapide
4. **Communiquer** l'état dans les logs

### Approche recommandée

- Nightly : WebKit inclus (validation complète)
- PR gate : Chromium seulement (rapide, bloquant)
- Fallback : Si WebKit flaky, le séparer en job manuel

## Maintenance

### Mise à jour des navigateurs

```bash
# Localement
npx playwright install --with-deps

# En CI
# Automatique via le workflow (npx playwright install --with-deps)
```

### Mise à jour de Playwright

```bash
npm install @playwright/test@latest
```

### Mise à jour du cron

Modifier `.github/workflows/responsive-nightly.yml` :

```yaml
on:
  schedule:
    - cron: "0 7 * * *"  # Changer l'heure ici
```

Format cron : `minute heure jour mois jour_semaine` (UTC)

## Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
npm run start:test --prefix backend

# Vérifier la base de données
psql postgresql://postgres:1234@localhost:5432/madsuite_test
```

### Le frontend ne démarre pas

```bash
# Vérifier les logs
npm run dev --prefix frontend

# Vérifier le port 3000
lsof -i :3000
```

### Les tests échouent sur Firefox/WebKit

1. Exécuter localement : `npx playwright test e2e/responsive-mobile.spec.js --project=firefox`
2. Vérifier les traces : `playwright-report/`
3. Documenter le problème (flakiness, CSS, timing)

### Artifacts manquants

- Vérifier que le workflow a échoué (`if: always()` capture les succès aussi)
- Vérifier la rétention (14 jours par défaut)
- Vérifier les permissions GitHub Actions

## Références

- **Standard officiel** : `SYSTEME_MAD/03-STANDARDS/std-106.md`
- **Checklist anti-régression** : `SYSTEME_MAD/09-CHECKLISTS/MOBILE_RESPONSIVE_ANTI_REGRESSION.md`
- **Checklist CI** : `SYSTEME_MAD/09-CHECKLISTS/MOBILE_RESPONSIVE_CI_INTEGRATION.md`
- **Checklist nightly** : `SYSTEME_MAD/09-CHECKLISTS/MOBILE_RESPONSIVE_NIGHTLY_EXTENDED.md`

## Critères d'acceptation — Phase 5

✅ Workflow nightly responsive existe  
✅ Workflow peut être lancé manuellement (`workflow_dispatch`)  
✅ Workflow est planifié chaque nuit (cron `0 7 * * *`)  
✅ Chromium, Firefox et WebKit sont couverts en nightly  
✅ Artifacts Playwright sont uploadés en cas d'échec  
✅ PR gate rapide Chromium reste intact  
✅ Commande `npm run test:e2e:responsive` fonctionne encore  
✅ Aucune logique métier modifiée  
✅ Aucun backend modifié  
✅ Documentation explique la différence PR gate vs nightly  

## Livrables

| Élément | Valeur |
|---------|--------|
| **Fichier workflow** | `.github/workflows/responsive-nightly.yml` |
| **Nom du workflow** | `Responsive Nightly Extended` |
| **Schedule cron** | `0 7 * * *` (7h UTC) |
| **Navigateurs** | Chromium, Firefox, WebKit |
| **Commande locale** | `npx playwright test e2e/responsive-mobile.spec.js --project=chromium --project=firefox --project=webkit` |
| **Artifacts** | `playwright-report/`, `test-results/` (14 jours) |
| **Documentation** | Ce fichier (`RESPONSIVE_NIGHTLY_EXTENDED.md`) |
| **Backend** | ✅ Inchangé |
| **Logique métier** | ✅ Inchangée |
| **PR gate** | ✅ Intact (Chromium seulement) |
| **WebKit** | ✅ Non obligatoire sur PR |

## Notes

- Le workflow nightly **ne bloque pas** les PR quotidiennes
- Le PR gate rapide Chromium reste **bloquant et rapide**
- WebKit est inclus mais **non obligatoire** sur les PR
- Les artifacts sont conservés **14 jours** pour analyse
- Le workflow peut être lancé **manuellement** via GitHub Actions
