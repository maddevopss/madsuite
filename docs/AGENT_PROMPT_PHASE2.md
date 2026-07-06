# MADSUITE PHASE 2 — FRONTEND UI UNIFICATION
## Agent Prompt Complet (Pages: Signup → Invoice → Dashboard → Settings)

---

## CONTEXTE CRITIQUE

✓ Phase 1 done: design-system scaffold + barrel exports ok
✓ Variables.css = source of truth (tokens: --color-*, --space-*, --radius-*, --bp-*)
✓ Legacy-compat.css = transition layer
✓ .page-container = standard layout
✓ NO PROVIDER REFACTOR (keep existing state management)

**Règles absolues** (UI_FOUNDATION_RULES.md):
- ❌ 0 hardcoded colors (#xxx, rgb(), rgba())
- ❌ 0 local CSS vars
- ❌ 0 new CSS files outside structure
- ✅ 100% tokens from variables.css
- ✅ .page-container wrapper
- ✅ ui/* components only
- ✅ Mobile-first responsive

---

## PHASE 2.1 — REVENUE FUNNEL (ABSOLUTE PRIORITY)

### PAGE: SIGNUP
**Risk**: LOW | **Impact**: HIGH | **Est**: 2h

**Input file**: `src/pages/Signup/index.jsx` + any .css in folder

**Checklist before edit**:
- [ ] File exists & readable
- [ ] Grep all hardcoded colors (`#`, `rgb`, `rgba`)
- [ ] List all inline styles
- [ ] Check current imports (Button/Input sources)
- [ ] Check .page-container presence

**Actions (ONLY)**:
1. Wrap root in `.page-container` (if missing)
2. Replace hardcoded colors → token names (e.g., `#ffffff` → `var(--color-bg-primary)`)
3. Replace form components → `ui/Button`, `ui/Input`, `ui/Card`
4. Remove inline styles → use token classes or variables.css mappings
5. Ensure mobile breakpoints use `--bp-mobile`, `--bp-tablet`, `--bp-desktop`

**Output validation**:
```bash
npm run build
npm run lint
```

Print report:
```
✓ Signup conformity:
  - Hardcoded colors: 0
  - Tokens used: X/X
  - .page-container: YES
  - ui/ components: Button, Input, Card
  - Mobile breakpoints: OK
  - Build status: ✓
```

---

### PAGE: ONBOARDING
**Risk**: HIGH | **Impact**: CRITICAL | **Est**: 3h

**Input file**: `src/pages/Onboarding/index.jsx` + any .css

**⚠️ DO NOT**:
- Modify flow logic
- Change section order or UX
- Remove features
- Alter modal behavior

**Actions**:
1. .page-container wrapper
2. Hardcoded colors → tokens
3. Cards → ui/Card + ui/* subcomponents
4. Spacing → --space-* tokens (no inline px)
5. CTA buttons → ui/Button (standardize variants)
6. Mobile overflow fix (flexbox, grid gaps, padding via tokens)
7. Grid/flex layout → ensure responsive at all breakpoints

**Validation same as Signup + "UX Flow Intact: YES"**

---

### PAGE: INVOICE FLOW (CREATE / VIEW / CHECKOUT)
**Risk**: VERY HIGH | **Impact**: CRITICAL | **Est**: 4h (split 3 pages if needed)

**Input files**: 
- `src/pages/Invoices/index.jsx` (list/create)
- `src/pages/Invoices/InvoiceDetail.jsx` (view)
- Any checkout integration page

**⚠️ EXTREME CAUTION**:
- This is your revenue engine
- Test after every change
- Checkout flow MUST work
- Form validation MUST work

**Actions**:
1. Tables → standardize (token-based padding, borders from variables.css)
2. Invoice cards → ui/Card
3. CTA buttons → ui/Button (ensure primary/secondary distinction)
4. Form inputs → ui/Input
5. Totals/metrics → ui/StatCard or custom but token-based
6. Checkout button styling → match Stripe/payment UX
7. Mobile grid breakpoints → explicit at --bp-mobile, --bp-tablet, --bp-desktop
8. Remove inline styles → use variables.css tokens
9. Hardcoded colors → replace with tokens

**Pre-validation**:
- [ ] Invoice list renders
- [ ] Create invoice form works
- [ ] View detail renders
- [ ] Checkout button accessible & styled

**Post-validation**:
```bash
npm run build
# Manual test: create invoice → view → attempt checkout (no payment, just flow)
```

---

## PHASE 2.2 — CORE PRODUCT UI

### PAGE: DASHBOARD
**Risk**: MEDIUM | **Impact**: HIGH | **Est**: 3h

**Actions**:
1. Grids/charts → responsive (no fixed widths unless necessary)
2. Metric cards → standardize (ui/StatCard or ui/Card)
3. Remove inline styles
4. Colors → tokens only
5. Spacing → --space-* tokens
6. Mobile layout → stack vertically, full width

---

### PAGE: SETTINGS / ADMIN
**Risk**: LOW | **Impact**: MEDIUM | **Est**: 2h

**Actions**:
1. Layout uniformity (sidebar, content area via tokens)
2. Form sections → ui/FormField + ui/Button
3. Tabs/toggles → standardized
4. Colors/spacing → tokens only

---

## PHASE 2.3 — SUPPORT UI

### PAGES: CLIENTS, TIMESHEET, REPORTS, ESTIMATES
**Risk**: LOW | **Impact**: LOW | **Est**: 1h each

**Actions** (same pattern):
1. .page-container
2. Hardcoded → tokens
3. Tables → standard (use ui/Table if exists, else create)
4. Spacing → tokens
5. Mobile breakpoints OK

---

## PHASE 2.4 — NON-CRITICAL (DO NOT START YET)

### PAGE: LANDING
**Status**: BLOCKED
**Unblock condition**: 50 signups OR 10 first invoices (funnel validation data)

---

## GENERIC TEMPLATE (REUSE FOR EACH PAGE)

```
# PHASE 2.X — [PAGE_NAME]

## Pre-edit
1. Read src/pages/[PAGE]/index.jsx
2. Grep hardcoded colors:
   grep -r '#[0-9a-fA-F]\|rgb\|rgba' src/pages/[PAGE]/ | grep -v node_modules
3. List inline styles: grep -E 'style=\{' src/pages/[PAGE]/*.jsx
4. Check imports: grep -E 'from.*ui/' src/pages/[PAGE]/*.jsx
5. Check .page-container: grep 'page-container' src/pages/[PAGE]/*.jsx

## Modify
- [ ] .page-container wrapper
- [ ] Hardcoded colors → tokens
- [ ] Components → ui/*
- [ ] Inline styles → tokens/classes
- [ ] Responsive breakpoints OK

## Post-edit
npm run build
npm run lint

## Report
[Copy template above]
```

---

## EXECUTION ORDER (STRICT)

1. ✅ Signup (done per your Phase 1 validation)
2. → Onboarding (next, HIGH RISK)
3. → Invoice Flow (next, VERY HIGH RISK)
4. → Dashboard (lower risk, can proceed in parallel)
5. → Settings (low risk, can proceed in parallel)
6. → Support UI (low risk, batch together)
7. BLOCKED: Landing (wait for funnel data)

---

## SUCCESS CRITERIA

Phase 2.1 complete when:
- ✓ Signup: 0 hardcodes, 100% tokens, responsive OK, build passes
- ✓ Onboarding: same + UX flow intact, mobile overflow fixed
- ✓ Invoice Flow: same + checkout functional, tables standardized

Phase 2.2 complete when:
- ✓ Dashboard responsive, no inline styles, tokens only
- ✓ Settings uniform layout, forms standardized

Phase 2.3 complete when:
- ✓ All support pages: tokens only, responsive, tables OK

Phase 2.4:
- ✓ Landing unblocked only after funnel validation

---

## IF STUCK

1. Token name unknown? → Check variables.css grep:
   ```bash
   grep --color-primary src/styles/variables.css
   ```

2. Component missing? → Check src/components/ui/:
   ```bash
   ls src/components/ui/
   ```

3. Breakpoint unclear? → Check variables.css breakpoints:
   ```bash
   grep --bp- src/styles/variables.css
   ```

4. Inline style -> token mapping? → Ask for specific style value, provide token alternative.

5. Build fails? → Show error, check for:
   - CSS syntax (missing semicolon, bracket)
   - Token name typo
   - Import path wrong

---

## NOTES

- Each page modification = separate commit (easier revert if needed)
- Test on mobile (DevTools) after each page
- Do NOT merge Landing until funnel data ready
- Do NOT touch state management (keep Context/Zustand as-is)
- Do NOT create new design tokens (use existing only, request new ones in separate PR)

EOF
cat docs/AGENT_PROMPT_PHASE2.md | head -80
