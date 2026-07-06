# FUNNEL ANALYSIS — READING PROTOCOL SANS BIAIS (MADSuite)

**Mode actuel : REVENUE OBSERVATION MODE**  
UI Foundation Lock: ACTIVE  
Ne pas optimiser UI avant seuils et revue de snapshot.

---

## RÈGLE D’OR (NON NÉGOCIABLE)

**INTERDIT :**
- Conclure sur < 50 signups
- Conclure sur < 10 invoices
- Modifier UI sur base de “feel”
- Optimiser un seul step isolé

**AUTORISÉ :**
- Observer tendances
- Identifier zones de friction
- Comparer ratios relatifs (pas absolus)

---

## STRUCTURE DE LECTURE CORRECTE

Ne pas lire comme : Signup → Invoice → Checkout

Lire comme :

1. **Attention** (Signup)
2. **Activation** (First Invoice)
3. **Intent** (Invoice Viewed → Checkout Clicked)
4. **Monetization** (Paid)

---

## LES 4 QUESTIONS À POSER TOUJOURS

### Q1 — Friction cognitive ?
**Question :** Les gens comprennent-ils la valeur ?

**Signal :**
- invoice_viewed ↑
- time_on_invoice faible

→ Problème = compréhension immédiate

### Q2 — Friction de décision ?
**Question :** Ils comprennent mais ne cliquent pas ?

**Signal :**
- invoice_viewed ↑↑
- checkout_clicked ↓

→ Problème = trust / urgency / CTA clarity

### Q3 — Friction de paiement ?
**Question :** Ils veulent payer mais n’aboutissent pas ?

**Signal :**
- checkout_started ↑
- subscription_active ↓

→ Problème = Stripe / friction technique / trust final

### Q4 — Perte de retour ?
**Question :** Ils quittent et ne reviennent jamais ?

**Signal :**
- invoice_viewed once
- no second session

→ Problème = absence de re-engagement loop

---

## LES SEULS RATIOS QUI COMPTENT (EARLY STAGE)

Ignore les counts bruts.

**Ratios clés :**
- `activation_rate = first_invoice / signups`
- `decision_rate = checkout_clicked / invoice_viewed`
- `monetization_rate = subscription_active / checkout_started`

---

## RÈGLE CRITIQUE DE CONTEXTE

**NE JAMAIS INTERPRÉTER ISOLÉ**

Exemple faux :
> “checkout_clicked est faible → CTA mauvais”

Bonne interprétation :
> “checkout_clicked faible + time_on_invoice faible → problème de compréhension, pas CTA”

---

## SIGNAL VS BRUIT

**BRUIT :**
- Variations jour à jour
- Petits volumes
- Sessions uniques

**SIGNAL :**
- Ratios stables sur 7–14 jours
- Comportement répété
- Cohérence entre étapes

---

## CE QUE TU CHERCHES VRAIMENT

Pas “plus de clics”

Mais : **réduction du temps entre compréhension et paiement**

---

## ANTI-PATTERN DANGEREUX : “CTA problem bias”

Tu vois : faible conversion

Tu conclus : “CTA doit être amélioré”

👉 souvent faux

**VRAI PROCESS :**

Diagnostiquer dans cet ordre :
1. Comprehension (invoice_viewed → time_on_invoice)
2. Trust (invoice_ready → checkout_clicked)
3. Urgency (time_to_checkout)
4. Execution (checkout → paid)

---

## SEUILS MINIMUM D’INTERPRÉTATION

- < 20 signups → **NO CONCLUSION**
- 20–50 signups → **SIGNAL WEAK ONLY**
- 50–100 signups → **PATTERN BEGINNING**
- 100+ → **OPTIMIZATION POSSIBLE**

---

## CE QUE TU DOIS FAIRE AU PREMIER SNAPSHOT

**Étape 1 — Ne rien optimiser**

**Étape 2 — Identifier seulement :**
- Where drop-off is highest
- Whether issue is cognitive vs trust vs timing

**Étape 3 — Formuler 1 seule hypothèse**

❌ pas 5 fixes  
✅ 1 hypothèse principale

---

## LA VRAIE RÈGLE SAAS

> “You don’t fix funnels.  
> You fix the constraint that blocks money flow.”

---

**Rappel :** Toute évolution UI doit respecter `docs/UI_FOUNDATION_RULES.md` et `docs/UI_LOCK_SIGNAL.md`.

Ce protocole est la référence pour toute lecture de données funnel.

---

## 12. TRUTH CONFIDENCE SCORE (CONCEPTUAL LAYER)

Ajoute mentalement (et plus tard dans le dashboard) une "colonne confiance" pour chaque événement/stage.

Ceci permet de distinguer :

- Actions rapides / impulsives
- Décisions réfléchies / avec contexte

### Exemple de scoring (0-100, à affiner avec données)

| Event / Signal                  | Base Score | Boosters (add)                  | Penalties (subtract)             | Example Confidence |
|--------------------------------|------------|----------------------------------|----------------------------------|--------------------|
| invoice_viewed                 | 20        | + time_on_invoice > 30s         | - time_on_invoice < 5s          | 25-45             |
| invoice_viewed                 | 20        | + scroll_depth > 60%            | - scroll < 20%                  |                    |
| checkout_clicked_from_invoice  | 60        | + previous time_on_invoice > 45s| - time < 10s                    | 50-80             |
| subscription_active            | 95        | (real money)                    | - refund within 7d              | 90-100            |

### Pourquoi c'est puissant

- Évite d'optimiser sur "faux positifs" (clics impulsifs).
- Distingue "je clique parce que c'est gros et vert" vs "j'ai compris la valeur et je décide de payer".
- Future-proof pour quand on ajoutera :
  - time_on_invoice
  - scroll_depth_invoice (light)
  - exit_without_checkout
  - return_session_after_view

### Implémentation future (légère, après seuils)

Dans le dashboard /funnel :
- Afficher un "Avg Confidence Score" par étape
- Filtrer les events avec confidence > X pour les ratios "qualité"

**Note :** Ne pas implémenter de tracking lourd maintenant. Garder en mode observation.

---

**Fin du protocole.** Utilise-le pour tout snapshot. Ne conclus pas avant seuils.

---

## 13. TRUTH CONFIDENCE MODEL (OPÉRATIONNEL SIMPLE)

Grille à utiliser **manuellement** sur chaque snapshot jusqu’à ce qu’on instrumente les signaux (time, scroll).

### Invoice Viewed
- <10s → 20
- 10–30s → 40
- 30–90s → 60
- + scroll proof → 70–80

### Checkout Clicked
- instant click (<10s) → 50 (suspect impulsif)
- 20–60s → 70
- 60s + scroll → 85–90

### Subscription Active
- 100 (truth event)

**Règle** : Un checkout à 50 n’est pas un signal business fort. Un checkout à 85+ = vraie intention.

---

## 14. A/B / DECISION MAP (QUAND VOLUME)

### Zone 1 — Low signal (NO ACTION)
- <50 signups
- <10 invoices

→ Observation only.

### Zone 2 — Emerging signal (DIAG ONLY)
- 50–200 signups

→ Lire funnel, détecter friction, **aucune** optimisation UI.

### Zone 3 — Decision validée (FIRST OPTIMIZATION)
- 200 signups OR strong invoice volume

→ Optimiser **UNE seule friction** à la fois.

### Zone 4 — Growth tuning
- Stable conversion baseline

→ A/B test uniquement sur checkout & invoice flow.

---

## 13. TRUTH CONFIDENCE SCORE (COLONNE MENTALE + FUTURE MESURABLE)

Ajoute systématiquement cette "colonne confiance" pour chaque étape du funnel. Elle permet de distinguer :

- Actions rapides / impulsives (faible confiance)
- Décisions réfléchies avec contexte (haute confiance)

### Score de base (0-100, à affiner avec données réelles)

| Event / Signal                    | Base | Boosters (+ )                              | Pénalités (- )                          | Exemple de score |
|-----------------------------------|------|--------------------------------------------|-----------------------------------------|------------------|
| invoice_viewed                    | 20   | + temps passé > 30s<br>+ scroll > 50%     | - temps < 5s<br>- scroll < 20%         | 25-45           |
| checkout_clicked_from_invoice     | 60   | + temps passé > 45s avant clic             | - clic < 10s après vue                 | 50-80           |
| subscription_active               | 95   | (argent réel)                              | - refund dans les 7-14j                | 90-100          |

### Règles d'utilisation

- **Faible confiance (< 40)** : ignorer ou pondérer très bas dans les ratios.
- **Confiance moyenne (40-70)** : utiliser avec prudence.
- **Haute confiance (> 70)** : fiables pour décisions.

### Future instrumentation légère (après seuils)

Quand on débloquera :
- `time_on_invoice_page`
- `scroll_depth_invoice` (léger, pas de tracking lourd)
- `return_session_after_view`

Puis calculer un **avg_confidence_score** par étape dans le dashboard.

**Objectif** : ne pas optimiser sur des "faux positifs" (clics impulsifs) mais sur des décisions de qualité.

---

**Ce protocole + ce score de confiance = ton vrai système d'observation.** 
Ne pollue pas les données tant que tu n'as pas les seuils.