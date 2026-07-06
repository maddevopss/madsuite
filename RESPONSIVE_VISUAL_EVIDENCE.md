# Phase 6 — Responsive Visual Evidence

## Vue d'ensemble

La Phase 6 ajoute une couche légère de preuves visuelles responsive pour MADSuite, complétant les phases précédentes :

- **Phase 1/P0** : Correction responsive mobile critique
- **Phase 2/P1** : Stabilisation UX mobile
- **Phase 3** : Tests Playwright anti-régression responsive
- **Phase 4** : CI Responsive Gate rapide sur Chromium
- **Phase 5** : Nightly Extended multi-navigateurs
- **Phase 6** : Visual Evidence — Screenshots ciblés pour diagnostic

## Architecture

### Suite de screenshots

**Fichier** : `e2e/responsive-screenshots.spec.js`

**Exécution** : Nightly seulement (non-bloquant)

**Navigateur** : Chromium (baseline visuelle)

**Objectif** : Faciliter le diagnostic des régressions responsive sans snapshot strict obligatoire

### Pages et breakpoints couverts

| Page | Breakpoint | Nom du screenshot | Objectif |
|------|-----------|------------------|----------|
| Dashboard | 390px | `dashboard-390px-mobile.png` | Layout mobile |
| Dashboard | 1440px | `dashboard-1440px-desktop.png` | Layout desktop |
| Invoices | 390px | `invoices-390px-mobile.png` | Tableau mobile |
| Timesheet | 390px | `timesheet-390px-mobile.png` | Stats mobile |
| Settings | 390px | `settings-390px-mobile.png` | Formulaires mobile |
| Header | 390px | `header-390px-mobile.png` | Navigation mobile |
| Main content | 390px | `main-content-390px-mobile.png` | Contenu principal |
| Clients | 390px | `clients-390px-mobile.png` | Grille clients |
| Projets | 390px | `projets-390px-mobile.png` | Grille projets |
| Reports | 390px | `reports-390px-mobile.png` | Graphiques mobile |

### Workflow intégration

Le workflow nightly exécute :

1. Tests responsive (Chromium, Firefox, WebKit)
2. **Screenshots visuels** (Chromium seulement)
3. Upload artifacts (rapports + screenshots)

**Étape ajoutée** :

```yaml
- name: Run responsive screenshots — Visual Evidence
  run: npx playwright test e2e/responsive-screenshots.spec.js --project=chromium
```

## Accès aux screenshots

### Dans GitHub Actions

1. Aller sur **GitHub Actions**
2. Sélectionner le workflow **Responsive Nightly Extended**
3. Cliquer sur la run (dernière exécution)
4. Télécharger l'artifact **playwright-responsive-nightly-report**
5. Extraire et ouvrir `test-results/screenshots/`

### Structure des artifacts

```
playwright-responsive-nightly-report/
├── playwright-report/
│   └── index.html (rapport HTML)
└── test-results/
    ├── screenshots/
    │   ├── dashboard-390px-mobile.png
    │   ├── dashboard-1440px-desktop.png
    │   ├── invoices-390px-mobile.png
    │   ├── timesheet-390px-mobile.png
    │   ├── settings-390px-mobile.png
    │   ├── header-390px-mobile.png
    │   ├── main-content-390px-mobile.png
    │   ├── clients-390px-mobile.png
    │   ├── projets-390px-mobile.png
    │   └── reports-390px-mobile.png
    └── [autres fichiers de test]
```

### Rétention

- **Screenshots** : 14 jours (dans `test-results/`)
- **Rapport HTML** : 14 jours
- **Traces** : 7 jours (en cas d'échec)

## Commandes locales

### Exécuter les screenshots localement

```bash
# Tous les screenshots
npx playwright test e2e/responsive-screenshots.spec.js

# Un seul screenshot
npx playwright test e2e/responsive-screenshots.spec.js -g "Dashboard @390px"

# Avec interface UI
npx playwright test e2e/responsive-screenshots.spec.js --ui
```

### Visualiser les screenshots

```bash
# Ouvrir le dossier des screenshots
open test-results/screenshots/

# Ou sur Windows
explorer test-results\screenshots\
```

## Politique des screenshots

### Non-bloquants

- Les screenshots **ne bloquent pas** le nightly
- Les tests échouent seulement si la navigation échoue
- Les screenshots sont des **preuves visuelles**, pas des assertions strictes

### Pas de snapshot testing

- **Pas de comparaison automatique** avec des baselines
- Les screenshots servent au **diagnostic manuel**
- Utiles pour détecter les régressions visuelles évidentes

### Utilisation recommandée

1. **Après une modification CSS** : Comparer les screenshots avant/après
2. **En cas de bug responsive** : Vérifier les screenshots pour le breakpoint affecté
3. **Pour la documentation** : Utiliser les screenshots dans les rapports de bug
4. **Pour la validation** : Montrer les screenshots aux designers/PO

## Maintenance

### Ajouter un nouveau screenshot

1. Ouvrir `e2e/responsive-screenshots.spec.js`
2. Ajouter un test :

```javascript
test("MyPage @390px - Screenshot", async ({ page }) => {
  await page.goto("/mypage");
  await page.waitForLoadState("networkidle");
  await page.setViewportSize(SCREENSHOT_BREAKPOINTS.mobile);
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join("test-results", "screenshots", "mypage-390px-mobile.png"),
    fullPage: true,
  });
});
```

3. Committer et pousser
4. Le nightly exécutera automatiquement le nouveau screenshot

### Modifier un breakpoint

Dans `e2e/responsive-screenshots.spec.js` :

```javascript
const SCREENSHOT_BREAKPOINTS = {
  mobile: { width: 390, height: 844, name: "390px-mobile" },
  desktop: { width: 1440, height: 900, name: "1440px-desktop" },
  // Ajouter un nouveau breakpoint
  tablet: { width: 768, height: 1024, name: "768px-tablet" },
};
```

### Modifier la rétention

Dans `.github/workflows/responsive-nightly.yml` :

```yaml
- name: Upload Playwright report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-responsive-nightly-report
    path: |
      playwright-report/
      test-results/
    retention-days: 14  # Changer ici
```

## Dépannage

### Les screenshots ne sont pas générés

1. Vérifier que le workflow a exécuté l'étape **Run responsive screenshots**
2. Vérifier les logs du workflow
3. Vérifier que `e2e/responsive-screenshots.spec.js` existe
4. Vérifier que les pages sont accessibles (login, navigation)

### Les screenshots sont flous ou mal cadrés

1. Augmenter `await page.waitForTimeout(500)` à 1000ms
2. Ajouter `await page.waitForLoadState("domcontentloaded")`
3. Vérifier que les éléments sont visibles avec `await expect(element).toBeVisible()`

### Les artifacts ne sont pas disponibles

1. Vérifier que le workflow a échoué ou réussi (artifacts uploadés dans les deux cas)
2. Vérifier la rétention (14 jours par défaut)
3. Vérifier les permissions GitHub Actions
4. Vérifier que `if: always()` est présent dans l'étape d'upload

### Taille des artifacts trop grande

- Les screenshots PNG sont généralement petits (~50-200 KB chacun)
- Si trop gros, réduire la résolution ou utiliser `fullPage: false`
- Limiter le nombre de screenshots si nécessaire

## Différences : Tests vs Screenshots

### Tests responsive (`responsive-mobile.spec.js`)

- **Assertions** : Vérifications strictes (scroll, layout, visibilité)
- **Bloquant** : OUI sur PR gate (Chromium), OUI sur nightly
- **Objectif** : Détecter les bugs fonctionnels
- **Navigateurs** : Chromium (PR), Chromium/Firefox/WebKit (nightly)

### Screenshots (`responsive-screenshots.spec.js`)

- **Preuves visuelles** : Captures pour diagnostic
- **Bloquant** : NON (informatif)
- **Objectif** : Faciliter le diagnostic des régressions visuelles
- **Navigateurs** : Chromium seulement (baseline)

## Critères d'acceptation — Phase 6

✅ Screenshots générés en nightly  
✅ Artifacts disponibles 14 jours  
✅ PR gate Chromium inchangé  
✅ Aucune logique métier modifiée  
✅ Documentation ajoutée  
✅ Screenshots non-bloquants  
✅ Pages critiques couvertes (Dashboard, Invoices, Timesheet, Settings)  
✅ Breakpoints couverts (390px mobile, 1440px desktop)  

## Livrables

| Élément | Valeur |
|---------|--------|
| **Fichier tests** | `e2e/responsive-screenshots.spec.js` |
| **Exécution** | Nightly seulement |
| **Navigateur** | Chromium (baseline) |
| **Pages couvertes** | 10 (Dashboard, Invoices, Timesheet, Settings, Header, Main, Clients, Projets, Reports) |
| **Breakpoints** | 390px (mobile), 1440px (desktop) |
| **Artifacts** | `test-results/screenshots/` (14 jours) |
| **Bloquant** | ❌ Non |
| **Snapshot testing** | ❌ Non (diagnostic manuel) |
| **Documentation** | Ce fichier (`RESPONSIVE_VISUAL_EVIDENCE.md`) |
| **Backend** | ✅ Inchangé |
| **Logique métier** | ✅ Inchangée |
| **PR gate** | ✅ Intact |

## Notes

- Les screenshots sont des **preuves visuelles**, pas des assertions
- Utiles pour **comparer avant/après** une modification CSS
- Facilite le **diagnostic des régressions** responsive
- Non-bloquants pour ne pas ralentir le nightly
- Conservés **14 jours** pour analyse
- Exécutés en **Chromium seulement** (baseline, rapide)

## Références

- **Phase 5** : `RESPONSIVE_NIGHTLY_EXTENDED.md`
- **Tests responsive** : `e2e/responsive-mobile.spec.js`
- **Workflow nightly** : `.github/workflows/responsive-nightly.yml`
- **Playwright docs** : https://playwright.dev/docs/test-snapshots
