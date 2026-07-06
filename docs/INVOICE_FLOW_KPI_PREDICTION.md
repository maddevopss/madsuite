# Invoice Flow — KPI Prediction Model (What Will Actually Move)

**Context:** Post-Phase 1 + early Phase 2/3 UI structure (Value Block dominant, Trust strip, CTA hierarchy started).  
**Mode:** REVENUE OBSERVATION MODE — UI FROZEN for measurement.

## Core Hypothesis
Making the payment decision moment cognitively clearer + more dominant will increase **checkout_clicked_from_invoice** without immediately destroying long-term paid conversion.

## Primary Funnel Metrics We Expect to Move

| Metric                              | Direction (short term) | Magnitude | Why it should move | Caveats / Second-order effects |
|-------------------------------------|------------------------|-----------|--------------------|--------------------------------|
| `invoice_viewed`                    | Stable or slight ↓     | Low       | Users decide faster, less browsing | If too aggressive, some may avoid opening entirely |
| `checkout_clicked_from_invoice`     | **↑↑**                 | High      | Value Block + single dominant CTA reduces friction | Biggest lever right now |
| `time_to_checkout` (minutes from view) | **↓↓**              | High      | Cognitive gap + timing gap closed | Monitor for "rushed" decisions |
| `checkout_clicked_from_invoice` → `subscription_active` | ↑ (delayed)     | Medium    | Higher intent at click = better paid conversion later | Trust gap may cap this |
| Refund / chargeback rate (30d)      | ↑ (risk)               | Medium    | "False decision confidence" — users click without fully processing | Most important lagging indicator |
| `invoice_viewed` → `checkout_clicked_from_invoice` conversion | **↑↑**          | High      | Direct test of Value + CTA work | Core north-star for this flow |

## Expected Impact by Failure Mode Addressed

1. **Cognitive Gap** ("I don't understand why I should pay")
   - Strong positive on checkout rate.
   - Risk: short-term conversion ↑, quality ↓ (refunds).

2. **Timing Gap** ("I'll do it later")
   - State banner + trust strip should reduce time_to_checkout.
   - Risk: feels pushy on mobile/enterprise clients.

3. **Trust Gap** ("I don't trust the amount")
   - Current visual trust strip helps a bit.
   - Real move will only come when we add **provable** elements (drill-down, audit view).

4. **Payment Friction**
   - CTA dominance + mobile sticky should help.
   - Risk: reduces perceived professionalism if overdone.

## Lagging Indicators (Watch These)

- Paid conversion (7d / 14d / 30d from invoice view)
- Refund rate on invoices that went through the new flow
- Support tickets mentioning "facture" or "montant"
- Repeat invoice behavior (do users who paid once come back faster?)

## What Probably Won't Move (or Moves the Wrong Way)

- Number of invoices created (that's upstream, in Onboarding/Dashboard)
- Average invoice value (unless we change what gets included)
- Backend events like `invoice_created` or `first_invoice_created`

## When to Declare Success / Failure (Proposed Thresholds)

- **Success (unlock next phase):** checkout_clicked_from_invoice rate +25% relative vs baseline, with refund rate not more than +1.5pp absolute.
- **Failure / pause:** checkout rate improves but refund rate +3pp or more, or enterprise clients complain about "pressure".
- **Neutral:** checkout rate flat → we didn't solve the real gap (probably still trust or upstream).

## Recommendation Right Now

**Do not touch the UI for 24-72h (or until we have a clean baseline of at least 20-30 invoice views post-changes).**

Current structure is good enough to measure real behavior. More iteration now = contaminated data.

When we have baseline numbers, we can decide:
- Light instrumentation + observe (recommended)
- Or run the 3-variant A/B map (if baseline is clear)

This keeps us in signal > noise mode.