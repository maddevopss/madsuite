# Audit Enterprise vs INTERNAL Modules — MADSuite 2026

**Date:** 7 juin 2026  
**Objectif:** Auditer et corriger la séparation enterprise vs modules INTERNAL.

---

## Étape 1 — État réel du code

### 1.1 Logique actuelle dans `backend/src/config/modules.js`

```javascript
function isModuleIncludedInPlan(moduleKey, planType) {
  const mod = MODULES[moduleKey];
  if (!mod) return false;

  const normalizedPlan = String(planType || "free").toLowerCase();

  if (mod.plan === "free") return true;
  if (mod.plan === "trial" && ["trial", "solo", "pro", "enterprise"].includes(normalizedPlan)) return true;
  if (mod.plan === "pro" && ["pro", "enterprise", "admin", "internal", "master_admin", "platform_admin"].includes(normalizedPlan)) return true;
  if (mod.plan === "addon" && INTERNAL_PLAN_TYPES.has(normalizedPlan)) return true;
  if (mod.plan === "internal" && INTERNAL_PLAN_TYPES.has(normalizedPlan)) return true;

  return false;
}
```

**Problème identifié (ligne 64):**
```javascript
if (mod.plan === "addon" && INTERNAL_PLAN_TYPES.has(normalizedPlan)) return true;
```

❌ **Les add-ons ne sont accessibles que pour les plans INTERNAL** (`admin`, `internal`, `master_admin`, `platform_admin`).

Cela signifie :
- `enterprise` n'a pas accès aux add-ons (calcul_km, estimates, quotes, etc.)
- Mais `enterprise` a accès aux modules `pro` (invoices, reports, kiosk_punch)

### 1.2 Modules INTERNAL

```javascript
const INTERNAL_MODULES = ["cognitive_engine", "desktop_agent"];
const INTERNAL_PLAN_TYPES = new Set(["admin", "internal", "master_admin", "platform_admin"]);
```

**Ligne 65:**
```javascript
if (mod.plan === "internal" && INTERNAL_PLAN_TYPES.has(normalizedPlan)) return true;
```

✅ **Les modules INTERNAL sont correctement réservés aux plans INTERNAL.**

### 1.3 Documentation actuelle

**Fichier:** `docs/PLANS_AND_SUBSCRIPTIONS.md` (ligne 19)

```
| **enterprise** | FREE + PRO + ADDON + INTERNAL (18) | ❌ À implémenter | Défini mais non créé par Stripe |
```

⚠️ **La documentation affirme que enterprise a accès aux 18 modules, incluant INTERNAL.**

Mais le code réel (ligne 64) **ne donne pas les add-ons à enterprise**.

### 1.4 Tests existants

**Fichier:** `backend/src/test/modulesRegistry.test.js` (ligne 42-46)

```javascript
test("includes pro modules for pro and enterprise", () => {
  expect(isModuleIncludedInPlan("invoices", "pro")).toBe(true);
  expect(isModuleIncludedInPlan("invoices", "enterprise")).toBe(true);
  expect(isModuleIncludedInPlan("invoices", "free")).toBe(false);
});
```

✅ **Le test vérifie que enterprise a les modules PRO.**

**Fichier:** `backend/src/test/modulesRegistry.admin.test.js` (ligne 42-45)

```javascript
test("pro plan does NOT include INTERNAL modules", () => {
  expect(isModuleIncludedInPlan("cognitive_engine", "pro")).toBe(false);
  expect(isModuleIncludedInPlan("desktop_agent", "pro")).toBe(false);
});
```

✅ **Le test vérifie que pro n'a pas les modules INTERNAL.**

**Mais il n'y a pas de test pour enterprise + INTERNAL.**

---

## Étape 2 — Comportement cible proposé

### Recommandation

**Enterprise ne doit pas avoir accès aux modules INTERNAL.**

Raison :
- Les modules INTERNAL (`cognitive_engine`, `desktop_agent`) sont marqués comme "usage admin/interne seulement"
- Ils ne sont pas prêts pour les clients
- La documentation elle-même dit "tant que non cadré produit"

### Matrice cible

| Plan | FREE | PRO | ADDON | INTERNAL |
|------|------|-----|-------|----------|
| **free** | ✅ | ❌ | ❌ | ❌ |
| **trial** | ✅ | ✅ | ❌ | ❌ |
| **pro** | ✅ | ✅ | ❌ | ❌ |
| **enterprise** | ✅ | ✅ | ✅ | ❌ |
| **admin** | ✅ | ✅ | ✅ | ✅ |
| **internal** | ✅ | ✅ | ✅ | ✅ |
| **master_admin** | ✅ | ✅ | ✅ | ✅ |
| **platform_admin** | ✅ | ✅ | ✅ | ✅ |

---

## Étape 3 — Correction minimale

### Problème à corriger

**Ligne 64 de `backend/src/config/modules.js`:**

```javascript
if (mod.plan === "addon" && INTERNAL_PLAN_TYPES.has(normalizedPlan)) return true;
```

Cela signifie : "Les add-ons ne sont accessibles que pour les plans INTERNAL."

**Mais enterprise devrait avoir accès aux add-ons.**

### Solution

Modifier la logique pour que `enterprise` ait accès aux add-ons :

```javascript
if (mod.plan === "addon" && ["enterprise", "admin", "internal", "master_admin", "platform_admin"].includes(normalizedPlan)) return true;
```

Ou plus lisible :

```javascript
const ADDON_ELIGIBLE_PLANS = new Set(["enterprise", "admin", "internal", "master_admin", "platform_admin"]);
if (mod.plan === "addon" && ADDON_ELIGIBLE_PLANS.has(normalizedPlan)) return true;
```

### Vérification : INTERNAL reste protégé

La ligne 65 reste inchangée :

```javascript
if (mod.plan === "internal" && INTERNAL_PLAN_TYPES.has(normalizedPlan)) return true;
```

Cela garantit que `cognitive_engine` et `desktop_agent` restent réservés aux plans INTERNAL.

---

## Étape 4 — Tests à ajouter/corriger

### Test 1 : Enterprise a accès aux add-ons

```javascript
test("enterprise plan includes ADDON modules", () => {
  expect(isModuleIncludedInPlan("calcul_km", "enterprise")).toBe(true);
  expect(isModuleIncludedInPlan("estimates", "enterprise")).toBe(true);
  expect(isModuleIncludedInPlan("quotes", "enterprise")).toBe(true);
  expect(isModuleIncludedInPlan("expenses", "enterprise")).toBe(true);
  expect(isModuleIncludedInPlan("payments", "enterprise")).toBe(true);
  expect(isModuleIncludedInPlan("activity_intelligence", "enterprise")).toBe(true);
  expect(isModuleIncludedInPlan("billing_assistant", "enterprise")).toBe(true);
});
```

### Test 2 : Enterprise n'a pas accès aux modules INTERNAL

```javascript
test("enterprise plan does NOT include INTERNAL modules", () => {
  expect(isModuleIncludedInPlan("cognitive_engine", "enterprise")).toBe(false);
  expect(isModuleIncludedInPlan("desktop_agent", "enterprise")).toBe(false);
});
```

### Test 3 : Pro n'a pas accès aux add-ons

```javascript
test("pro plan does NOT include ADDON modules", () => {
  expect(isModuleIncludedInPlan("calcul_km", "pro")).toBe(false);
  expect(isModuleIncludedInPlan("estimates", "pro")).toBe(false);
  expect(isModuleIncludedInPlan("quotes", "pro")).toBe(false);
});
```

### Test 4 : Admin a accès à tout

```javascript
test("admin plan includes all modules (FREE + PRO + ADDON + INTERNAL)", () => {
  expect(isModuleIncludedInPlan("dashboard", "admin")).toBe(true);
  expect(isModuleIncludedInPlan("invoices", "admin")).toBe(true);
  expect(isModuleIncludedInPlan("estimates", "admin")).toBe(true);
  expect(isModuleIncludedInPlan("cognitive_engine", "admin")).toBe(true);
});
```

---

## Étape 5 — Mise à jour documentation

### Fichier : `docs/PLANS_AND_SUBSCRIPTIONS.md`

**Avant (ligne 19):**
```
| **enterprise** | FREE + PRO + ADDON + INTERNAL (18) | ❌ À implémenter | Défini mais non créé par Stripe |
```

**Après:**
```
| **enterprise** | FREE + PRO + ADDON (15) | ✅ Webhook | Créé via Stripe checkout |
```

**Ajouter section (après ligne 30):**

```markdown
### 1.3 Séparation Enterprise vs INTERNAL

**Important:** Les modules INTERNAL (`cognitive_engine`, `desktop_agent`) ne sont **jamais** accessibles aux clients, même en plan enterprise.

- **Enterprise:** Accès à FREE + PRO + ADDON (15 modules)
- **Admin/Internal:** Accès à tous les modules (18 modules)

Les modules INTERNAL sont réservés à l'administration de la plateforme et ne sont pas prêts pour les clients.
```

**Mettre à jour section 7.1 (ligne 223-226):**

**Avant:**
```markdown
1. **Enterprise a accès aux modules INTERNAL**
   - `cognitive_engine` et `desktop_agent` sont inclus dans enterprise
   - À valider : doivent-ils vraiment être offerts aux clients ?
   - Recommandation : Créer un plan `enterprise_plus` ou limiter à `pro`
```

**Après:**
```markdown
1. ✅ **CORRIGÉ : Enterprise n'a pas accès aux modules INTERNAL**
   - `cognitive_engine` et `desktop_agent` restent réservés aux plans admin/internal
   - Enterprise a accès à FREE + PRO + ADDON (15 modules)
   - Correction appliquée : Modification de `isModuleIncludedInPlan()` pour ajouter enterprise aux plans ADDON_ELIGIBLE
```

---

## Résumé des modifications

| Fichier | Action | Raison |
|---------|--------|--------|
| `backend/src/config/modules.js` | MODIFIER | Ajouter enterprise aux plans ADDON_ELIGIBLE |
| `backend/src/test/modulesRegistry.test.js` | AJOUTER | Tests enterprise + ADDON |
| `backend/src/test/modulesRegistry.admin.test.js` | AJOUTER | Tests enterprise + INTERNAL (doit être false) |
| `docs/PLANS_AND_SUBSCRIPTIONS.md` | MODIFIER | Corriger documentation, ajouter séparation INTERNAL |

---

## Comportement final

### Avant correction
- Enterprise : FREE + PRO + ADDON + INTERNAL (18 modules) ❌
- Pro : FREE + PRO (8 modules) ✅
- Admin : FREE + PRO + ADDON + INTERNAL (18 modules) ✅

### Après correction
- Enterprise : FREE + PRO + ADDON (15 modules) ✅
- Pro : FREE + PRO (8 modules) ✅
- Admin : FREE + PRO + ADDON + INTERNAL (18 modules) ✅

---

## Risques restants

1. **Orgs existantes avec plan_type = 'enterprise'**
   - Aucune action requise (la logique s'applique automatiquement)
   - Elles perdront accès à `cognitive_engine` et `desktop_agent` (qui n'étaient pas prêts pour les clients)

2. **Frontend doit refléter la logique backend**
   - Vérifier que `frontend/src/api/modules.api.js` utilise la même logique
   - Actuellement : Frontend importe `isModuleIncludedInPlan` du backend ✅

3. **Stripe mapping**
   - Aucun changement nécessaire
   - `resolvePlanTypeFromStripeSubscription()` continue de mapper vers "pro" ou "enterprise"


