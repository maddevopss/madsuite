# Security Guidelines

## Objectif

Aucune donnée d'une organisation ne doit être accessible par une autre organisation.

---

# Authentification

| Mécanisme | Implémentation |
|-----------|----------------|
| Access token | JWT HS256, cookie `access_token` httpOnly |
| Refresh token | Cookie `refresh_token` httpOnly, rotation à chaque refresh |
| Bearer fallback | Header `Authorization: Bearer` (desktop-agent) |
| Sessions | Table `user_sessions` avec `organisation_id` |
| Refresh storage | `refresh_tokens.token_hash` (hashé, pas en clair) |
| Réutilisation refresh | Détection → révocation massive + alerte sécurité |

Routes publiques : `/api/login`, `/api/health`

Fichiers clés : `auth.service.js`, `authTokens.js`, `middleware/auth.js`, `routes/login.js`

### WIP non monté

`auth.routes.js` + `auth.controller.js` existent mais ne sont **pas** montés dans `app.js`. Auth active = `login.js`.

---

# Autorisation

| Couche | Mécanisme |
|--------|-----------|
| Rôles | `admin` / `employe` via `requireRole.js` |
| Organisation | `requireOrganisation` middleware |
| Feature flags | `ENABLE_V1_NON_CORE_FEATURES` pour routes non-core |
| RLS PostgreSQL | `app.current_organisation_id` par requête |

Tests : `backend/src/test/integration/rls-security.spec.js`

---

# Multi Tenant

Colonne : `organisation_id` (pas `organizationId`)

Tables critiques verrouillées :

- `activity_app_rules`, `activity_patterns`, `activity_context_rules` — NOT NULL (019a)
- `user_sessions.organisation_id` — NOT NULL (020)
- RLS activé sur tables sensibles (019b, 023, 027, 028)

---

# Validation

- Zod côté serveur (`backend/src/validators/`)
- Zod côté frontend (schemas par page)
- Desktop agent : validation IPC Zod (`handleSecure`)

Ne jamais faire confiance au frontend.

---

# API Security

| Protection | Fichier |
|------------|---------|
| Helmet + CSP | `config/security.js`, `app.js` |
| Rate limiting | `config/rateLimiters.js` (login, activity, default) |
| CORS verrouillé | `config/cors.js` — `FRONTEND_URL`, `ELECTRON_URL` |
| Request ID | `middleware/requestId.js` |
| Error handler | `middleware/errorHandler.js` (pas de fuite stack en prod) |

---

# Alertes sécurité

- Table `security_incidents_buffer` (partitionnée)
- Job `securityBufferJob.js` — envoi email groupé
- `email.service.js` — throttle 1h, priorité haute
- Optionnel : BullMQ + Redis pour file async

---

# Desktop Agent

Voir aussi `SECURITY.md` racine (agent Electron).

- JWT via `electron-store` chiffré (`safeStorage`)
- Refresh mutex (évite race conditions)
- Logs : redaction tokens Bearer
- IPC : `handleSecure` + Zod

---

# Base de données

Interdictions :

❌ SELECT sans filtre organisation (ou sans contexte RLS)

Exemple accepté :

```sql
SELECT * FROM invoices WHERE organisation_id = $1
```

---

# Secrets Management

Variables sensibles dans `.env` (jamais commitées) :

- `JWT_SECRET` (32+ chars)
- `DB_PASSWORD`
- `EMAIL_PASS`
- `BCRYPT_SALT_ROUNDS`

Templates versionnés : `.env.example`, `.env.docker.dev`, `backend/.env.example`

Ne jamais commiter : `.env.docker.local`, `.env.test`

---

# Logs

Ne jamais logger :

- mots de passe
- tokens
- secrets
- clés API

Winston : `backend/src/config/logger.js`

---

# Audit pré-release

- [ ] Tests RLS (`rls-security.spec.js`)
- [ ] Tests invoices security (`invoices.security.test.js`)
- [ ] `npm run db:preflight:org --prefix backend`
- [ ] Vérifier CORS origins prod
- [ ] Confirmer `ENABLE_V1_NON_CORE_FEATURES` désactivé en prod
