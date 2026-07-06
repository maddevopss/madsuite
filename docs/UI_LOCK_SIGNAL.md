# UI LOCK SIGNAL — MADSuite

## Status
UI Foundation Lock: ACTIVE

## Scope Locked
- Signup UI: LOCKED
- Onboarding UI: LOCKED
- Invoice UI: LOCKED
- Dashboard UI: LOCKED
- Landing UI: EXCLUDED (not part of funnel lock)

## Allowed Changes (ONLY)
- Critical bug fixes (funnel breakage)
- Token fixes (variables.css only)
- Accessibility fixes
- Mobile-breaking layout fixes

## Forbidden Changes
- New UI features
- New components
- Refactors of pages under lock
- Design system changes
- Color / spacing experimentation

## Unlock Condition
UI can only be modified when BOTH are true:
- ≥ 50 signups OR ≥ 10 invoices created
- Funnel snapshot has been reviewed

## Current Goal
Observe real user behavior without UI interference.

## Active Metrics Source
/api/analytics/funnel
/funnel (admin dashboard)

## Last Lock Date
2026-06-22

## Invoice Flow Specific Note
Phase 1 (View + Value Block) + early Phase 2/3 (CTA + Trust) UI changes applied in controlled way.
**FULLY FROZEN** for observation.

Use:
- docs/FUNNEL_SNAPSHOT_TEMPLATE.md (copy-paste format)
- docs/FUNNEL_READING_PROTOCOL.md (with Truth Confidence + Decision Map)
- /funnel admin dashboard (has "Générer Snapshot Brut" button)

No UI changes on locked pages until thresholds + reviewed snapshot.

## Notes
This lock exists to ensure revenue funnel measurements are not contaminated by UI iteration noise.