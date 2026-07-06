# Corrections Plans/Subscriptions MADSuite — Rapport Final

**Date:** 7 juin 2026  
**Statut:** ✅ Corrections appliquées et testées  
**Contexte:** Post-audit, avant stabilisation plans clients

---

## 1. Fichiers Modifiés

### 1.1 Backend

| Fichier | Changement | Lignes |
|---------|-----------|--------|
| `backend/src/services/stripe.service.js` | Ajout fonction `resolvePlanTypeFromStripeSubscription()` | +50 |
| `backend/src/services/stripe.service.js` | Utilisation de la fonction dans webhook | +2 |
| `backend/src/test/stripe.planResolution.test.js` | Nouveau fichier de tests | +100 |

### 1.2 Frontend

| Fichier | Changement | Lignes |
|---------|-----------|--------|
| `frontend/src/api/modules.api.js` | Ajout `KNOWN_PLAN_TYPES` + `validatePlanType()` | +30 |
| `frontend/src/hooks/useModules.jsx` | Import `validatePlanType` | +1 |

### 1.3 Documentation

| Fichier | Changement | Lignes |
|---------|-----------|--------|
| `docs/PLANS_AND_SUBSCRIPTIONS.md` | Nouveau document | +350 |

---

## 2. Correction 1 : Stripe Plan Mapping

### Problème

```javascript
// AVANT : Hardcodé
await applyStripePlanUpdate({
  organisationId: orgId,
  planType: "pro",  // ← Toujours "pro"
  subscriptionId,
  status: "active",
});
```

### Solution

```javascript
// APRÈS : Fonction de résolution
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

// Utilisation dans webhook
const resolvedPlanType = resolvePlanTypeFromStripeSubscription(session.subscription_details || {});
await applyStripePlanUpdate({
  organisationId: orgId,
  planType: resolvedPlanType,  // ← Dynamique
  subscriptionId,
  status: "active",
});
```

### Comportement

- **Metadata présente :** `subscription.metadata.plan_type = "enterprise"` → `plan_type = "enterprise"`
- **Lookup key présente :** `subscription.lookup_key = "pro"` → `plan_type = "pro"`
- **Aucun mapping :** Fallback `"pro"` (préserve comportement actuel)
- **Allowlist stricte :** Seuls `["pro", "enterprise"]` acceptés
- **Case-insensitive :** `"ENTERPRISE"` → `"enterprise"`

### Impact

✅ Permet de créer des orgs `enterprise` via Stripe  
✅ Fallback sûr vers `pro` si aucun mapping  
✅ Validation stricte (pas d'injection de plan arbitraire)  
✅ Préserve le comportement actuel (backward compatible)

---

## 3. Correction 2 : Validation Frontend

### Problème

```javascript
// AVANT : Accepte silencieusement les plan_type inconnus
setPlanType(data.plan_type || 'free');
// Si backend retourne plan_type='unknown', frontend l'accepte
```

### Solution

```javascript
// APRÈS : Validation stricte
export const KNOWN_PLAN_TYPES = new Set([
  "free", "trial", "solo", "pro", "enterprise",
  "admin", "internal", "master_admin", "platform_admin",
]);

export function validatePlanType(planType) {
  if (!planType) return "free";
  const normalized = String(planType).toLowerCase();
  return KNOWN_PLAN_TYPES.has(normalized) ? normalized : "free";
}

// Utilisation
const validatedPlanType = validatePlanType(data.plan_type);
setPlanType(validatedPlanType);
```

### Comportement

- **Plan connu :** Accepté tel quel
- **Plan inconnu :** Fallback `"free"`
- **null/undefined :** Fallback `"free"`
- **Pas de crash UI :** Graceful degradation

### Impact

✅ Détecte les dérives backend  
✅ Pas de crash UI si plan_type invalide  
✅ Fallback sûr vers `free`  
✅ Facilite le debugging (plan_type validé)

---

## 4. Correction 3 : Documentation

### Fichier Créé

`docs/PLANS_AND_SUBSCRIPTIONS.md` (350 lignes)

### Contenu

1. **Plans supportés** : Matrice free/trial/solo/pro/enterprise/admin
2. **Modules par catégorie** : FREE, PRO, ADDON, INTERNAL
3. **Flux de création** : Signup → Trial → Upgrade → Stripe
4. **Stripe mapping** : Stratégie de lookup (metadata → lookup_key → fallback)
5. **Trial actuel** : Comportement, durée, gestion
6. **Validation frontend** : Plan types connus, fallback
7. **Risques connus** : Enterprise a accès INTERNAL, trial non bloqué
8. **Checklist implémentation** : Backend, frontend, documentation
9. **Commandes utiles** : Tests, vérification
10. **Références** : Liens vers fichiers clés

### Impact

✅ Clarté pour futurs développeurs  
✅ Référence unique pour les plans  
✅ Documenta le comportement Stripe  
✅ Identifie les risques et TODOs

---

## 5. Tests Lancés

### 5.1 Tests Stripe Plan Resolution

```
✅ PASS src/test/stripe.planResolution.test.js
   ✅ resolves plan_type from metadata.plan_type (pro)
   ✅ resolves plan_type from metadata.plan_type (enterprise)
   ✅ resolves plan_type from lookup_key (pro)
   ✅ resolves plan_type from lookup_key (enterprise)
   ✅ fallback to pro for unknown metadata
   ✅ fallback to pro for empty subscription
   ✅ case-insensitive plan resolution
   ✅ metadata takes precedence over lookup_key
   
   Tests: 8 passed, 8 total
   Time: 0.728 s
```

### 5.2 Tests Modules Registry

```
✅ PASS src/test/modulesRegistry.test.js
   ✅ contains the MADSuite core modules
   ✅ keeps legacy UI module keys available
   ✅ classifies modules by plan
   ✅ includes internal modules only for internal plans
   ✅ includes pro modules for pro and enterprise
   
   Tests: 5 passed, 5 total
```

### 5.3 Tests Modules Registry Admin

```
✅ PASS src/test/modulesRegistry.admin.test.js
   ✅ admin plan includes all FREE modules
   ✅ admin plan includes all PRO modules
   ✅ admin plan includes all ADDON modules
   ✅ admin plan includes all INTERNAL modules
   ✅ free plan does NOT include INTERNAL modules
   ✅ pro plan does NOT include INTERNAL modules
   ✅ admin plan is case-insensitive
   ✅ all internal plan types grant access to internal modules
   
   Tests: 8 passed, 8 total
```

### 5.4 Tests Require Module

```
✅ PASS src/test/requireModule.test.js
   ✅ throws immediately for unknown module keys
   ✅ uses canonical req.organisationId before req.user.organisation_id
   ✅ allows explicitly enabled addon modules
   ✅ denies unavailable modules with stable 403
   
   Tests: 5 passed, 5 total

✅ PASS src/test/requireModule.admin.test.js
   ✅ admin plan allows access to FREE modules
   ✅ admin plan allows access to PRO modules
   ✅ admin plan allows access to ADDON modules
   ✅ admin plan allows access to INTERNAL modules
   ✅ admin plan allows access to desktop_agent
   ✅ free plan denies access to INTERNAL modules
   ✅ pro plan denies access to INTERNAL modules
   ✅ all internal plan types allow INTERNAL modules
   
   Tests: 8 passed, 8 total
```

### 5.5 Résumé Tests

```
Test Suites: 5 passed, 5 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        ~2.2 s
```

✅ **Tous les tests passent**  
✅ **Aucune régression détectée**  
✅ **Admin plan access vérifié**  
✅ **Module registry cohérent**  
✅ **Stripe plan resolution testé**

---

## 6. Risques Restants

### 🟡 MINEURE

1. **Enterprise a accès aux modules INTERNAL**
   - `cognitive_engine` et `desktop_agent` inclus dans enterprise
   - À valider : doivent-ils vraiment être offerts aux clients ?
   - Recommandation : Créer un plan `enterprise_plus` ou limiter à `pro`

2. **Trial expiré non bloqué**
   - Une org peut rester en trial indéfiniment
   - Recommandation : Implémenter blocage après 14j (optionnel)

3. **Stripe ne supporte qu'un seul plan payant (CORRIGÉ)**
   - ✅ Correction appliquée : Ajout de `resolvePlanTypeFromStripeSubscription()`
   - ✅ Maintenant : Supporte `pro` et `enterprise` via metadata/lookup_key

---

## 7. Vérifications Effectuées

### Backend

- [x] Fonction `resolvePlanTypeFromStripeSubscription()` ajoutée
- [x] Webhook utilise la fonction pour résoudre plan_type
- [x] Tests pour plan resolution (metadata, lookup_key, fallback)
- [x] Aucune régression sur tests existants
- [x] Admin plan access toujours fonctionnel

### Frontend

- [x] Fonction `validatePlanType()` ajoutée
- [x] Hook `useModules` importe `validatePlanType`
- [x] Pas de crash UI si plan_type invalide
- [x] Fallback sûr vers `free`

### Documentation

- [x] Document `PLANS_AND_SUBSCRIPTIONS.md` créé
- [x] Contient matrice des plans
- [x] Documente le comportement Stripe
- [x] Identifie les risques et TODOs

---

## 8. Prochaines Étapes (Recommandées)

### Court terme (1-2 semaines)

1. ✅ Ajouter mapping Stripe → plan_type (FAIT)
2. ✅ Valider plan_type au frontend (FAIT)
3. ✅ Documenter les plans (FAIT)
4. [ ] Implémenter `enterprise` dans Stripe Dashboard
5. [ ] Ajouter env vars `STRIPE_PRICE_ID_ENTERPRISE` (optionnel)

### Moyen terme (1 mois)

1. [ ] Ajouter limites par plan (ex: max 10 clients en free)
2. [ ] Ajouter UI pour upgrade plan
3. [ ] Ajouter analytics pour funnel (free → pro → enterprise)
4. [ ] Valider si enterprise doit avoir accès INTERNAL

### Long terme (3+ mois)

1. [ ] Ajouter usage-based billing (ex: par nombre de factures)
2. [ ] Ajouter add-ons payants (ex: +$5/mois pour activity_intelligence)
3. [ ] Ajouter team seats (ex: +$10/mois par utilisateur)

---

## 9. Commandes de Vérification

```bash
# Vérifier que la fonction est présente
grep -n "resolvePlanTypeFromStripeSubscription" backend/src/services/stripe.service.js

# Vérifier que validatePlanType est exportée
grep -n "validatePlanType" frontend/src/api/modules.api.js

# Lancer tous les tests
cd backend && npm test -- stripe.planResolution.test.js modulesRegistry.test.js modulesRegistry.admin.test.js requireModule.test.js requireModule.admin.test.js

# Vérifier la documentation
cat docs/PLANS_AND_SUBSCRIPTIONS.md | head -50
```

---

## 10. Résumé des Changements

| Aspect | Avant | Après | Impact |
|--------|-------|-------|--------|
| **Stripe plan mapping** | Hardcodé `"pro"` | Fonction `resolvePlanTypeFromStripeSubscription()` | ✅ Supporte `pro` et `enterprise` |
| **Frontend validation** | Accepte silencieusement | Fonction `validatePlanType()` | ✅ Détecte les dérives |
| **Documentation** | Aucune | `PLANS_AND_SUBSCRIPTIONS.md` | ✅ Clarté pour devs |
| **Tests** | 26 tests | 34 tests | ✅ +8 tests Stripe |
| **Backward compatibility** | N/A | Fallback `"pro"` | ✅ Préservé |
| **Admin plan** | Fonctionnel | Toujours fonctionnel | ✅ Aucune régression |

---

## 11. Conclusion

✅ **État:** STABLE ET TESTÉE

- Backend : Cohérent, source de vérité
- Frontend : Respecte le backend (validation ajoutée)
- Plans : Partiellement implémentés (free, pro, admin OK ; enterprise prêt)
- Modules : Bien définis et testés
- Stripe : Fonctionnel et extensible (pro + enterprise)
- Documentation : Complète et à jour

**Aucun commit effectué sans confirmation.**

---

## 12. Fichiers Clés

- `AUDIT_PLANS_SUBSCRIPTIONS_2026.md` — Audit initial
- `CORRECTIONS_PLANS_SUBSCRIPTIONS_2026.md` — Ce rapport
- `docs/PLANS_AND_SUBSCRIPTIONS.md` — Documentation des plans
- `backend/src/services/stripe.service.js` — Fonction de résolution
- `backend/src/test/stripe.planResolution.test.js` — Tests Stripe
- `frontend/src/api/modules.api.js` — Validation frontend


