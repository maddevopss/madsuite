# SPRINT 2 — FRONTEND UNIFICATION (PLAN ULTRA PRÉCIS)

**Objectif global**  
Transformer le frontend en :
- UI cohérente SaaS
- Responsive stable
- Basée sur Design System V1 (variables.css + legacy-compat + page-container)
- Sans casser le funnel
- Sans refactor global brutal

**Stratégie** : Réduction de variance visuelle (pas un refactor complet).

---

## ORDER OF EXECUTION (CRITIQUE)

### 🔴 PHASE 2.1 — FONCTIONNEL REVENUE (PRIORITÉ ABSOLUE)

**1. Signup Page**
- Risque : LOW / Impact : HIGH
- Actions :
  - Remplacer toutes couleurs hardcodées
  - Utiliser .page-container
  - Aligner forms sur tokens
  - Standardiser Button / Input
- ⚠️ Ne pas toucher structure UX

**2. Onboarding Page**
- Risque : HIGH / Impact : CRITIQUE
- Actions :
  - Layout unifié
  - Sections card standard
  - Spacing system 100% tokens
  - Corriger mobile overflow
  - Harmoniser CTA buttons
- ⚠️ Ne pas toucher flow logique

**3. Invoice Flow (CREATE → VIEW → CHECKOUT)**
- Risque : HIGH / Impact : CRITIQUE
- Actions :
  - Standardiser tables
  - Harmoniser cards invoice
  - Aligner CTA checkout
  - Corriger grid mobile breakpoints
- ⚠️ C’est ton revenue engine UI

### 🟠 PHASE 2.2 — CORE PRODUCT UI

**4. Dashboard**
- Risque : MEDIUM / Impact : HIGH
- Actions :
  - Remplacer grids non responsive
  - Harmoniser metric cards
  - Supprimer inline styles
  - Appliquer spacing system

**5. Settings / Admin**
- Risque : LOW / Impact : MEDIUM
- Actions :
  - Standardiser layout
  - Uniformiser sections

### 🟡 PHASE 2.3 — SUPPORT UI

**6. Clients / Timesheet / Reports**
- Risque : LOW / Impact : LOW
- Actions :
  - Cleanup visuel
  - Standardisation tables
  - Responsive fix only

### 🔵 PHASE 2.4 — NON-CRITICAL

**7. Landing Page (DO NOT TOUCH EARLY)**
- Risque : VERY HIGH
- 👉 Seulement après validation funnel data (50 signups ou 10 premières factures)

---

## RÈGLES DE CONTRÔLE (AVANT CHAQUE MODIFICATION)

Avant chaque modification :
- Vérifier `.page-container` présent
- Vérifier tokens utilisés (variables.css)
- Vérifier mobile breakpoint appliqué
- Vérifier aucun hardcode color
- Vérifier que les ui/ composants sont utilisés quand possible

### Definition of Done (chaque page)
- [ ] 0 couleur hardcodée
- [ ] 100% tokens utilisés
- [ ] Responsive OK (mobile / tablet)
- [ ] UI composants réutilisés (ui/ folder)
- [ ] Pas de CSS local critique
- [ ] Structure UX / flow logique intact

---

## RISQUE GLOBAL DU SPRINT 2

| Zone              | Risque     |
|-------------------|------------|
| Onboarding        | 🔴 élevé   |
| Invoice flow      | 🔴 très élevé |
| Signup            | 🟡 moyen   |
| Dashboard         | 🟡 moyen   |
| Settings          | 🟢 faible  |

---

## STRATÉGIE

- Tu ne fais **PAS** un refactor UI complet.
- Tu fais une **réduction de variance visuelle**.
- Toujours protéger le funnel en priorité.
- Ne pas toucher Landing avant d'avoir des données réelles.

---

**Prochaines étapes après ce plan :**
1. Exécuter Phase 2.1 en commençant par Signup
2. Puis Onboarding
3. Puis Invoice Flow
4. Seulement après : Dashboard, etc.

**Ne pas passer à Design System V2 ou Landing avant la fin de ce sprint contrôlé.**