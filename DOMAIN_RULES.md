# TimeMonitoring - Core Architectural Rules & Execution Policies

## Architecture Overview: "Event-Driven Financial Control System with Deterministic Execution Gating"

The system is strictly structured around 5 explicit layers to prevent "semantic overload of correctness" and blurry responsibilities. 

1. **Execution Layer**: Single gate for business/financial operations (`execution_decision.allowed`).
2. **Truth Layer**: The actual state of the business (Ledger, Stripe reconciliation, Invoices).
3. **Observability Layer**: Read-only metrics (Score, Confidence, Status) to diagnose health.
4. **Audit Layer**: Periodic integrity checks (Reconciliation Job, `system_integrity_report`).
5. **Safety Layer**: Execution invariants (ALS strict context, missing context detection, crash recovery).

---

## 🥇 THE GOLDEN RULE OF EXECUTION

To prevent implicit decisions, fragmented conditions, and debugging nightmares when onboarding new developers, the following rule is ABSOLUTE:

> **ONLY ONE EXECUTION POLICY EXISTS:** 
> `execution_decision.allowed`

**Everything else must be treated explicitly as OBSERVABILITY ONLY.**

### What this means in practice:
- **DO NOT** use `status === 'HEALTHY'` to block or allow an invoice.
- **DO NOT** use `confidence > 50` to decide if an email should be sent.
- **DO NOT** use `score > 80` anywhere for execution paths.
- **ALWAYS** check `execution_decision.allowed` before running any side-effect or financial operation.

If a developer adds a new metric, health indicator, or anomaly score, it **MUST NOT** be used in an `if` statement for a business process. It must either remain an observability metric, or it must be mathematically integrated upstream into the single `execution_decision` object within `systemHealth.service.js`.

---

## 🔎 Reconciliation Rules
- **Reconciliation jobs produce FACTS ONLY.**
- They operate in strict *read-only forensic mode*.
- They do not mutate state, and they do not embed escalation logic.
- Escalation policy must be externalized to a policy engine (or the caller).

---

## 🛡️ Context Safety (ALS)
- Every system operation must be wrapped in `runWithContext()`.
- Missing context in DEV/TEST = **Hard Crash** (Fail Loudly).
- Missing context in PROD = **Safe Degradation** (Fallback to 'strict' mode) + Metric Alert (`missing_context_incidents`). No silent failures.

---

## ⛈️ Systemic Failure Management
- Systemic failures (Storms) are detected on a **single-node basis** using an in-memory sliding window.
- Storm signatures must always include the `INSTANCE_ID` to prevent cross-node alert jitter and correlated failure noise.
- Aggregation and deduplication happen downstream at the log/alert aggregator level.
