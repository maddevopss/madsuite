# UI FOUNDATION RULES — MADSuite Frontend

**Context:**  
The frontend now uses a unified design system (`variables.css` + `legacy-compat.css` layer + `.page-container` layout system).  

This document defines the **strict rules** for any new UI work or contributions.  
Violations introduce long-term technical debt and risk breaking the conversion funnel.

---

## 1. Design System Rules (STRICT)

- **NEVER** introduce local CSS variables in page files or component files.
- **NEVER** hardcode colors (`#xxxxxx`, `rgb()`, `rgba()`) in components or pages.
- **ALWAYS** use tokens from `variables.css`.
- If a token does not exist → **it must be added centrally first** (in `variables.css`).

---

## 2. Layout Rules

- Every page **MUST** use `.page-container` as the top-level wrapper.
- No custom `max-width` logic per page.
- No page-specific layout containers unless explicitly approved in advance.

**Standard pattern:**
```jsx
<div className="page-container">
  {/* page content */}
</div>
```

---

## 3. Responsive Rules (mandatory)

- **Mobile-first only**.
- Use the official breakpoints defined in `variables.css`:
  - `--bp-mobile` (768px)
  - `--bp-tablet` (1024px)
  - `--bp-desktop` (1280px)
- Avoid ad-hoc media queries unless absolutely necessary.

**Example:**
```css
/* Mobile first */
.component { ... }

@media (min-width: 768px) {
  .component { ... }
}
```

---

## 4. Component Rules

- Prefer existing `ui/` components (`Button`, `Card`, `Input`, `Modal`, `StatCard`, etc.).
- Do **not** recreate UI primitives inside page-specific CSS.
- If a component is missing → create it in `src/components/ui/`, **never** inside a page folder.

---

## 5. CSS Structure Rules

Allowed structure only:

| Location              | Purpose                              | Allowed content                  |
|-----------------------|--------------------------------------|----------------------------------|
| `src/styles/global.css` | Base resets & global rules          | Global styles only              |
| `src/styles/variables.css` | Single source of truth (design tokens) | Tokens only                     |
| `src/styles/legacy-compat.css` | Temporary alias layer (deprecated over time) | Legacy mappings only            |
| `src/components/ui/`   | Reusable components                  | Component + its CSS             |
| Page folders (`src/pages/*/`) | Layout & page-specific orchestration | **Layout only** — no new styling logic |

---

## 6. Forbidden Patterns

- ❌ Duplicate `:root` definitions anywhere
- ❌ Page-specific or feature-specific design systems
- ❌ Inline styles for layout/spacing/colors (use tokens)
- ❌ New color systems per page or feature
- ❌ New CSS files that bypass the token system
- ❌ Hardcoded pixel values for spacing when a `--space-*` token exists

---

## 7. Goal

Maintain **a single coherent SaaS UI system** optimized for:

- Conversion (funnels: signup → onboarding → first invoice → checkout)
- Responsiveness (mobile-first)
- Maintainability (no CSS chaos)
- Visual consistency (professional B2B SaaS feel)

**Any violation of these rules introduces long-term technical debt.**

---

## Enforcement

- New PRs touching UI must reference this document.
- Reviewers should flag any breach of the rules above.
- When in doubt: **use existing tokens + `.page-container` + `ui/` components**.

---

## Current State (as of this document)

- Tokens centralized in `variables.css`
- Legacy compatibility layer active in `legacy-compat.css`
- `.page-container` is the standard layout wrapper
- Breakpoints defined
- Funnel pages (Signup, Onboarding, Invoices, Dashboard) are protected first

**Do not start refactoring pages until this foundation has been observed in production for at least one cycle.**

---

**Last updated:** 2026-06-22  
**Version:** 1.0 (Foundation Lock)