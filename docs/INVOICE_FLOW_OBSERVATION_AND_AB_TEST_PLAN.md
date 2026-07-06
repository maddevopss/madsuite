# Invoice Flow — Observation & A/B Test Plan (Revenue Core)

**Current Mode:** REVENUE OBSERVATION MODE + UI LOCK (post Phase 1 + early Phase 2/3)

**Objective:** Measure real user behavior on the new conversion layer **without further UI noise**.

---

## 1. KPI Prediction Model (What Will Move)

When we unlock and run controlled experiments, here is the expected impact on funnel metrics (based on current structure):

### Primary KPI
- **Invoice → Checkout conversion rate** (checkout_clicked_from_invoice / first_invoice_created)

**Expected directional moves from current state:**

| Metric                        | Current Direction | Predicted Move (if Value + CTA dominant) | Why |
|-------------------------------|-------------------|------------------------------------------|-----|
| invoice_viewed                | High              | Stable or slight ↓ (users decide faster) | Less browsing, more decision |
| checkout_clicked_from_invoice | Low               | **↑↑** (biggest lever)                   | Value clear + single CTA reduces friction |
| time_to_checkout (minutes)    | High              | **↓↓**                                   | Cognitive + timing gaps closed |
| subscription_active (from this path) | Low        | ↑ (medium term)                          | Better intent = higher paid conversion |
| refund / chargeback rate      | Unknown           | ⚠️ Monitor (possible ↑ short term)       | "False confidence" risk |

**Secondary signals to watch:**
- scroll_depth on invoice view (should ↓ if Value Block works)
- time_spent_before_CTA_click (should ↓)
- exit_rate without click (should ↓)

**Risk predictions:**
- Short-term: checkout ↑ but paid conversion flat (trust gap)
- Medium-term: if trust/proof added → paid conversion ↑
- If over-simplified: refund rate may ↑ (false decision confidence)

---

## 2. A/B Test Map — Phase 2 Variants (When Unlocked)

**Test only after we have baseline data from current locked state (≥50 signups or ≥10 invoices recommended).**

### Hypothesis
"Strengthening the payment decision moment (clarity + dominance + subtle urgency) will increase checkout_clicked_from_invoice without increasing refunds."

### Test Structure
- **Control:** Current locked version (Value Block + trust strip + primary CTA)
- **Traffic split:** 50/50 or 33/33/33 (use feature flag or simple split)
- **Duration:** Until statistical significance or 100+ checkouts per variant

### Variant A — "Pure Clarity" (Low risk)
- Value Block exactly as now (big total, hours, client, period)
- CTA: "Payer maintenant (Stripe)" + "Paiement sécurisé via Stripe"
- No extra urgency text
- Expected: checkout ↑ , refund risk low

### Variant B — "Proof + Urgency" (Medium risk)
- Same Value Block
- Add small "Proof line" under total: "Basé sur 12h de temps tracké automatiquement"
- CTA: "Recevoir le paiement maintenant" + subtle "La plupart des clients paient en <7 jours"
- Expected: checkout ↑↑ but monitor refund rate

### Variant C — "Contextual Trust" (Higher risk, high learning)
- Value Block
- Trust strip made more explicit: "Facture générée automatiquement depuis ton tracking d'activité — aucune saisie manuelle"
- CTA same as B + small link "Voir le détail du tracking" (opens simple modal with time entries summary)
- Expected: highest intent quality, but possible friction if link is used

### Metrics per Variant (in addition to primary)
- checkout_clicked_from_invoice
- time_to_checkout
- paid conversion (7/14/30 days)
- refund/chargeback rate (30 days)
- support tickets mentioning "facture" (qualitative)

**Stop criteria:**
- Clear winner on checkout rate with no refund spike, or
- One variant shows refund rate >2x control → kill it

---

## 3. Revenue Leakage Map (Even if UI is "Perfect")

Even with perfect Invoice Flow UI, money can still leak here (prepare these for later analysis):

1. **Value not created yet** → users never reach first_invoice (onboarding friction)
2. **Invoice created but never viewed** → no email/notification trigger or poor list UX
3. **Viewed but timing wrong** → no re-engagement loop (reminders, "X days unpaid" nudges)
4. **Clicked checkout but abandoned at Stripe** → pricing surprise, payment method friction, trust at payment step
5. **Paid once but no repeat** → no recurring setup or subscription upsell path from this flow
6. **Enterprise / trust issues** → invoice looks "too simple" for big clients (needs PO number, tax details, audit export visible)

**Preparation note:** When we have data, slice the funnel by:
- client size / plan_type
- first vs repeat invoice
- mobile vs desktop

---

## 4. Observation Protocol (Right Now)

**Do not touch Invoice Flow UI for the next 24-72h (or until we have a clean baseline snapshot).**

Daily check (via /api/analytics/funnel or /funnel page):
- first_invoice_created count
- checkout_clicked_from_invoice (or general checkout_started attributed to invoices)
- time_to_checkout (if we can compute from events)
- Any new "invoice_viewed" events (once instrumented lightly)

**Red flags to watch before unlocking further changes:**
- checkout rate < 15% on invoices
- median time_to_checkout > 30min
- refund rate > 5% on this path

**Green light to resume controlled experiments:**
- Stable baseline for 48h+
- Clear signal on where the drop is (value vs timing vs trust vs CTA)

---

## Next Recommended Action (when data arrives)

1. Pull a clean snapshot of the current locked state.
2. Decide: light instrumentation first (add invoice_viewed + checkout_from_invoice events) **or** directly unlock A/B.
3. Run the 3-variant test above.
4. Only after a winner: move to Phase 3 full trust/proof layer + re-engagement.

This keeps us in signal > noise mode.

---

**Status:** Observation mode active. No further UI edits to Invoice Flow until baseline data reviewed.

Ready when you have the first real numbers.