# MADSuite — Autofix Agent Tuning Protocol

## 🎯 OBJECTIF

Ce protocole définit comment calibrer le PR Auto-Fix Agent pour :

> simplifier uniquement ce qui est réellement complexe
> sans supprimer de logique utile
> sans sur-corriger le système

---

# ⚠️ PROBLÈME À ÉVITER

Un auto-fix agent non calibré peut :

* supprimer de la logique nécessaire
* fusionner des modules qui doivent rester séparés
* réduire la nuance fonctionnelle
* casser la stabilité du système à long terme

---

# 🧠 PRINCIPLE OF CONTROLLED SIMPLICITY

```txt id="rule1"
Simplification must reduce complexity, not reduce capability
```

---

# 🎯 1. COMPLEXITY THRESHOLD RULE

Le agent ne doit intervenir que si :

```txt id="rule2"
Complexity Score ≥ 40
```

Sinon :

👉 NO ACTION

---

# 🧱 2. PRESERVE FUNCTIONAL BOUNDARIES

Même en cas de simplification :

❌ interdit :

* fusionner State Engine avec autre module
* supprimer distinction history vs aggregates
* réduire Event → State flow

✔ autorisé :

* suppression de logique dupliquée
* réduction de conditions internes
* refactor interne sans changement d’architecture

---

# 🧠 3. FUNCTIONALITY PRESERVATION RULE

```txt id="rule3"
No functional regression allowed
```

Si une simplification :

* change un comportement observable
* change un output
* change un state result

👉 elle est INVALID

---

# 🧭 4. HIERARCHY OF IMPORTANCE

Le agent doit respecter cet ordre :

1. Correctness (fonctionne)
2. Determinism (stable output)
3. Simplicity (clean code)
4. Performance (optionnel)

---

# 🚫 5. OVER-SIMPLIFICATION DETECTION

Refuser toute simplification qui :

* supprime une abstraction nécessaire
* réduit la capacité d’extension future
* élimine séparation de responsabilité

---

# 🧠 6. “MINIMUM VIABLE COMPLEXITY”

Chaque module doit conserver :

```txt id="rule4"
the minimum complexity required to fulfill its responsibility
```

Pas moins.

---

# 🔍 7. SIMPLIFICATION VALIDATION CHECKLIST

Avant d’appliquer un fix :

## A. Does it reduce duplication?

✔ YES → allowed

## B. Does it remove cognitive interpretation layers?

✔ YES → allowed

## C. Does it reduce capability?

❌ YES → forbidden

## D. Does it merge unrelated responsibilities?

❌ YES → forbidden

---

# 🧪 8. AUTO-FIX BOUNDARY RULE

Le agent peut uniquement :

✔ refactor internal logic
✔ remove duplication
✔ simplify conditions
✔ flatten unnecessary nesting

Il ne peut PAS :

❌ redesign architecture
❌ move responsibilities between modules
❌ change system flow
❌ introduce new abstractions

---

# 📊 9. DUAL SCORING SYSTEM

Chaque PR reçoit 2 scores :

## Complexity Score (pre-fix)

* évalue la complexité actuelle

## Risk Score (post-fix impact)

* évalue si le fix change le comportement

---

# 🚨 DECISION MATRIX

| Condition                     | Action      |
| ----------------------------- | ----------- |
| Complexity < 40               | NO ACTION   |
| Complexity ≥ 40 + Low Risk    | AUTO-FIX    |
| Complexity ≥ 40 + Medium Risk | SUGGEST FIX |
| High Risk                     | BLOCK       |

---

# 🧠 10. GOLDEN RULE

```txt id="rule5"
Never simplify at the cost of correctness or architectural clarity
```

---

# 🎯 FINAL GOAL

Le système doit évoluer vers :

* moins de duplication
* moins de bruit logique
* même architecture stable
* zéro perte de fonctionnalité

---

# 🧭 VISION

MADSuite n’est pas un système qui devient plus simple.

C’est un système qui :

> reste simple tout en restant complet
