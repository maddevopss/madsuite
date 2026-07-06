# Plans et Subscriptions MADSuite

**Date:** 7 juin 2026  
**Version:** 1.0  
**Statut:** Documentation des plans actuels et comportement Stripe

---

## 1. Plans Supportés

### 1.1 Plans Clients

| Plan | Modules | Stripe | Comportement |
|------|---------|--------|--------------|
| **free** | FREE (5) | N/A | Défaut pour nouvelles orgs, 14j trial |
| **trial** | FREE + PRO (8) | N/A | Défini mais non créé par Stripe |
| **solo** | FREE + invoices, estimates, quotes | N/A | Défini mais non créé par Stripe |
| **pro** | FREE + PRO (8) | ✅ Webhook | Créé via Stripe checkout |
| **enterprise** | FREE + PRO + ADDON (15) | ✅ Webhook | Créé via Stripe checkout |

### 1.2 Plans Internes

| Plan | Modules | Utilisation |
|------|---------|-------------|
| **admin** | Tous (18) | Organisation Administration (seed 064) |
| **internal** | Tous (18) | Alias pour admin |
| **master_admin** | Tous (18) | Alias pour admin |
| **platform_admin** | Tous (18) | Alias pour admin |

**Important:** Ne pas utiliser `ADMIN_INTERNAL`. Utiliser `admin`, `internal`, `master_admin`, ou `platform_admin`.

### 1.3 Séparation Enterprise vs INTERNAL

**Important:** Les modules INTERNAL (`cognitive_engine`, `desktop_agent`) ne sont **jamais** accessibles aux clients, même en plan enterprise.

- **Enterprise:** Accès à FREE + PRO + ADDON (15 modules)
- **Admin/Internal:** Accès à tous les modules (18 modules)

Les modules INTERNAL sont réservés à l'administration de la plateforme et ne sont pas prêts pour les clients.

---

## 2. Modules par Catégorie

### FREE (5 modules)
- dashboard
- clients
- projects
- timesheet
- time_tracking

### PRO (3 modules)
- invoices
- reports
- kiosk_punch

### ADDON (10 modules)
- calcul_km
- kiosk_km
- estimates
- quotes
- expenses
- payments
- activity_intelligence
- billing_assistant

### INTERNAL (2 modules)
- cognitive_engine
- desktop_agent

---

## 3. Flux de Création d'Organisation

```
1. Signup
   ↓
2. Org créée avec plan_type='free' + trial_ends_at = NOW() + 14 days
   ↓
3. Utilisateur peut accéder aux modules FREE
   ↓
4. Utilisateur clique "Upgrade" → Stripe Checkout
   ↓
5. Stripe webhook checkout.session.completed
   ↓
6. plan_type mis à jour (pro ou enterprise selon mapping)
   ↓
7. Utilisateur accède aux modules du nouveau plan
```

---

## 4. Stripe Mapping (Webhook)

### Résolution du plan_type

**Stratégie de lookup (dans l'ordre) :**

1. **metadata.plan_type** (si présent et valide)
   - Exemple: `subscription.metadata.plan_type = "enterprise"`
   - Allowlist: `["pro", "enterprise"]`

2. **lookup_key** (si présent et valide)
   - Exemple: `subscription.lookup_key = "pro"`
   - Allowlist: `["pro", "enterprise"]`

3. **Fallback: "pro"**
   - Préserve le comportement actuel
   - Utilisé si aucun mapping clair n'existe

### Exemple de Configuration Stripe

```javascript
// Créer deux prices dans Stripe Dashboard :

// Price 1 : Pro ($20/mois)
{
  lookup_key: "pro",
  metadata: { plan_type: "pro" }
}

// Price 2 : Enterprise ($50/mois)
{
  lookup_key: "enterprise",
  metadata: { plan_type: "enterprise" }
}
```

### Webhook Handling

```javascript
// backend/src/services/stripe.service.js
function resolvePlanTypeFromStripeSubscription(subscription) {
  const ALLOWED_PLANS = new Set(["pro", "enterprise"]);
  
  // 1. Vérifier metadata.plan_type
  if (subscription?.metadata?.plan_type) {
    const planFromMeta = String(subscription.metadata.plan_type).toLowerCase();
    if (ALLOWED_PLANS.has(planFromMeta)) {
      return planFromMeta;
    }
  }
  
  // 2. Vérifier lookup_key
  if (subscription?.lookup_key) {
    const planFromLookup = String(subscription.lookup_key).toLowerCase();
    if (ALLOWED_PLANS.has(planFromLookup)) {
      return planFromLookup;
    }
  }
  
  // 3. Fallback : "pro"
  return "pro";
}
```

---

## 5. Trial Actuel

### Comportement

- **Durée:** 14 jours (hardcodé dans `auth.service.js`)
- **Création:** Lors du signup
- **Expiration:** Stockée dans `organisations.trial_ends_at`
- **Gestion:** Job `trialReminderJob` envoie des emails

### Flux

```
Signup
  ↓
trial_ends_at = NOW() + INTERVAL '14 days'
  ↓
Jour 12 : Email "Votre trial expire dans 2 jours"
  ↓
Jour 14 : Email "Votre trial a expiré"
  ↓
Org reste en plan_type='free' (pas de blocage)
```

### TODO : Trial Expiration

- [ ] Implémenter blocage d'accès après expiration (optionnel)
- [ ] Ajouter UI pour afficher "Trial expires in X days"
- [ ] Ajouter CTA "Upgrade now" après expiration

---

## 6. Validation Frontend

### Plan Types Connus

```javascript
// frontend/src/api/modules.api.js
export const KNOWN_PLAN_TYPES = new Set([
  "free",
  "trial",
  "solo",
  "pro",
  "enterprise",
  "admin",
  "internal",
  "master_admin",
  "platform_admin",
]);

export function validatePlanType(planType) {
  if (!planType) return "free";
  const normalized = String(planType).toLowerCase();
  return KNOWN_PLAN_TYPES.has(normalized) ? normalized : "free";
}
```

### Comportement

- Plan type connu → Accepté
- Plan type inconnu → Fallback "free"
- null/undefined → Fallback "free"
- Pas de crash UI

---

## 7. Risques Connus

### 🔴 CRITIQUE

Aucun risque critique détecté.

### 🟡 MINEURE

1. ✅ **CORRIGÉ : Enterprise n'a pas accès aux modules INTERNAL**
   - `cognitive_engine` et `desktop_agent` restent réservés aux plans admin/internal
   - Enterprise a accès à FREE + PRO + ADDON (15 modules)
   - Correction appliquée : Modification de `isModuleIncludedInPlan()` pour ajouter enterprise aux plans ADDON_ELIGIBLE

2. **Trial expiré non bloqué**
   - Une org peut rester en trial indéfiniment
   - Recommandation : Implémenter blocage après 14j (optionnel)

3. **Stripe ne supporte qu'un seul plan payant (avant correction)**
   - Correction appliquée : Ajout de `resolvePlanTypeFromStripeSubscription()`
   - Maintenant : Supporte `pro` et `enterprise` via metadata/lookup_key

---

## 8. Checklist Implémentation

### Backend

- [x] Fonction `resolvePlanTypeFromStripeSubscription()` ajoutée
- [x] Webhook utilise la fonction pour résoudre plan_type
- [x] Tests pour plan resolution (metadata, lookup_key, fallback)
- [ ] Implémenter `enterprise` dans Stripe Dashboard
- [ ] Ajouter env vars `STRIPE_PRICE_ID_ENTERPRISE` (optionnel)

### Frontend

- [x] Fonction `validatePlanType()` ajoutée
- [x] Hook `useModules` importe `validatePlanType`
- [ ] Utiliser `validatePlanType()` dans `normalizeModulesPayload()`
- [ ] Ajouter tests pour plan validation

### Documentation

- [x] Ce document créé
- [ ] Ajouter à README.md
- [ ] Ajouter à ARCHITECTURE.md

---

## 9. Commandes Utiles

### Tests

```bash
# Backend : Tests Stripe
npm test -- --testNamePattern="stripe"

# Backend : Tests modules
npm test -- --testNamePattern="module"

# Backend : Tests admin
npm test -- --testNamePattern="admin"

# Frontend : Tests modules
npm test -- --testNamePattern="modules"
```

### Vérification

```bash
# Vérifier que la fonction est exportée
grep -n "resolvePlanTypeFromStripeSubscription" backend/src/services/stripe.service.js

# Vérifier que validatePlanType est utilisée
grep -n "validatePlanType" frontend/src/api/modules.api.js
```

---

## 10. Références

- **Audit:** `AUDIT_PLANS_SUBSCRIPTIONS_2026.md`
- **Stripe Service:** `backend/src/services/stripe.service.js`
- **Modules Config:** `backend/src/config/modules.js`
- **Modules API:** `frontend/src/api/modules.api.js`
- **Seed Admin:** `backend/db/migrations/064_seed_administration_organisation.sql`

---

## 11. Historique

| Date | Auteur | Changement |
|------|--------|-----------|
| 2026-06-07 | AI CTO | Document créé, corrections appliquées |


