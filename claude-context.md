# MADSuite — Claude Context (OPTIMIZED)

You are working inside the MADSuite repository.

This file is the ONLY required context for understanding the project.

Do NOT re-explain architecture unless asked.
Do NOT restate full codebase.
Prefer direct actions over explanations.

---

# 🧠 PROJECT GOAL

Build a SaaS for SMEs and freelancers.

Primary objective:

- Reach $500 MRR as fast as possible

Focus priorities:

1. Multi-tenant safety
2. Revenue-generating features
3. Maintainability
4. Fast iteration

---

# ⚙️ CURRENT SYSTEM

Monorepo **TimeMonitoring** (produit: **MADSuite**, ex-MADSuite).

```
frontend/           React 19 + Vite + React Router
backend/            Express 5 + PostgreSQL (pg) + Zod
desktop-agent/      Electron + active-win tracking
madsuite-ai-panel/  VS Code extension (dev tooling only)
```

**Flux:** Frontend/Electron → Express REST `/api/*` → PostgreSQL (RLS via `app.current_organisation_id`)

---

# 📦 CORE MODULES (ACTIVE)

- Auth (JWT cookies, refresh rotation, `user_sessions`)
- Dashboard, Clients, Projects, Timesheet, Timer
- Reports (CSV/PDF export)
- Invoices (CRUD, numérotation, PDF jsPDF)
- Organisation settings (rétention, timezone)
- Activity intelligence + Billing assistant (feature-flagged)
- Desktop agent (window scan, activity logs)
- Email service + security incidents buffer

---

# 🚧 PLANNED MODULES

- Soumissions / Estimates (no DB table)
- Stripe Payments (decided, not implemented)
- Landing page
- Advanced PDF branding (basic exists)

---

# 🧠 DEVELOPMENT RULES (STRICT)

- Always prefer minimal change over full rewrite
- Preserve existing comments in code
- Do not refactor unrelated files
- Think SaaS first (revenue impact matters)
- Keep output minimal unless explicitly asked

---

# ⚡ RESPONSE FORMAT (IMPORTANT)

When performing tasks, respond ONLY in:

## RESULT

- what changed

## FILES

- list of files touched

## IMPACT

- business value (MRR / feature relevance)

## NEXT STEP (optional)

- only if necessary

---

# 🧯 TOKEN OPTIMIZATION RULES

To reduce token usage:

- Avoid repeating project summary
- Do not explain known architecture
- Assume context is already loaded from this file
- Prefer bullet points over paragraphs
- Skip reasoning unless asked
- Output code only when required

---

# 🧠 CODE PRINCIPLES

- Multi-tenant safe by default
- Stateless services preferred
- Keep services small and isolated
- Avoid over-engineering
- Prefer readable code over clever code

---

# 🔌 WORKFLOW PATTERN

Typical task flow:

1. Understand command (feature / bugfix / ci / loop)
2. Identify affected module
3. Apply minimal change
4. Output structured result

---

# 💀 HARD RULES

- Never re-describe MADSuite architecture
- Never output full file tree unless requested
- Never generate unnecessary explanations
- Never expand scope of task

---

# 🚀 INTENT

This project is optimized for:

- fast iteration
- SaaS monetization
- minimal cognitive overhead
