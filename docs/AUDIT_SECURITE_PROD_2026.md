# 🔐 RAPPORT D'AUDIT SÉCURITÉ PRODUCTION — MADSuite / TimeMonitoring
**Date :** 2026-06-24  
**Auditeur :** Architecte Sécurité Senior (mode hostile SOC2/ISO-lite)  
**Version analysée :** V5.2 / 2.0.0  
**Périmètre :** Backend Node.js, PostgreSQL, Frontend React, Electron Desktop Agent, Jobs Async

---

## 1. VERDICT GLOBAL

```
⚠️  SAFE WITH RISKS
```

Le projet présente une architecture multi-tenant globalement solide avec RLS PostgreSQL, middleware d'isolation, et plusieurs corrections récentes (audit 2026-06-24). Cependant, **5 risques critiques (P0)** et **8 risques majeurs (P1)** subsistent en production.

---

## 2. 🚨 RISQUES CRITIQUES (P0)

### P0-1 — Hub Routes : `req.user.organisationId` inexistant dans le JWT
**Fichiers :** `backend/src/routes/hub.routes.js`, `backend/src/services/hub.service.js`

**Description :** Le JWT encode `organisation_id` (snake_case), mais `hub.routes.js` accède à `req.user.organisationId` (camelCase). Cette propriété est **toujours `undefined`** en production.

**Impact :** Toutes les requêtes Hub passent `undefined` comme `orgId` au service. Dans `hub.service.js`, les requêtes SQL utilisent `WHERE organisation_id = $1` avec `undefined` → comportement imprévisible (erreur SQL ou scan global selon le driver).

**Preuve :**
```javascript
// hub.routes.js ligne 19
const projects = await hubService.getProjects(req.user.organisationId); // undefined!

// authTokens.js ligne 48
organisation_id: user.organisation_id ?? null, // snake_case dans le JWT
```

**Correction :** Remplacer `req.user.organisationId` par `req.user.organisation_id` dans tout `hub.routes.js`.

---

### P0-2 — Socket Hub : Broadcast global non isolé par organisation
**Fichier :** `backend/src/routes/hub.routes.js` lignes 88, 100, 113, 126, 140

**Description :** Les événements Socket.IO sont émis via `req.app.get('io').emit(...)` — ce qui broadcast à **TOUS les clients connectés** de toutes les organisations, pas seulement à l'organisation concernée.

**Impact :** Cross-tenant data leakage en temps réel. Un admin d'org A voit les événements (task_started, invoice_created, payment_recorded) de l'org B.

**Preuve :**
```javascript
req.app.get('io').emit('task_started', task);    // GLOBAL broadcast
req.app.get('io').emit('invoice_created', invoice); // GLOBAL broadcast
```

**Correction :** Utiliser `io.to('org_${orgId}').emit(...)` via le namespace `/hub` qui isole par room.

---

### P0-3 — Socket Hub : `user.organisationId` toujours undefined → room isolation cassée
**Fichier :** `backend/src/socket/hub.socket.js` lignes 59-64

**Description :** Le socket vérifie `user.organisationId` (camelCase) mais le JWT contient `organisation_id` (snake_case). La vérification `if (!user?.organisationId)` est donc **toujours vraie** → tous les clients sont déconnectés immédiatement.

**Impact :** Le namespace `/hub` est inutilisable. Aucun client ne peut se connecter. La room isolation `org_${user.organisationId}` est cassée.

**Preuve :**
```javascript
// hub.socket.js ligne 59
if (!user?.organisationId) {
  console.log("Missing organisationId, disconnecting"); // Toujours exécuté
  return socket.disconnect(true);
}
```

**Correction :** Utiliser `user.organisation_id` (snake_case, cohérent avec le JWT).

---

### P0-4 — Socket.IO Server : CORS wildcard `*` en fallback
**Fichier :** `backend/server.js` ligne 89

**Description :** L'initialisation Socket.IO utilise `origin: process.env.FRONTEND_URL || "*"`. Si `FRONTEND_URL` n'est pas défini en production, le CORS Socket.IO accepte **toutes les origines**.

**Impact :** N'importe quel site web peut établir une connexion WebSocket au serveur de production.

**Preuve :**
```javascript
io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // DANGER si FRONTEND_URL absent
```

**Correction :** Utiliser la même logique que `config/cors.js` (whitelist stricte). Fail-secure si `FRONTEND_URL` absent.

---

### P0-5 — AI Copilot : Injection de prompt système via messages client
**Fichiers :** `backend/src/routes/aiAssistant.routes.js`, `backend/src/services/ai.service.js`

**Description :** Le tableau `messages` envoyé par le client est passé directement à OpenAI sans filtrage des rôles. Un attaquant peut injecter des messages avec `role: "system"` pour override le system prompt.

**Impact :** Prompt injection → exfiltration de données d'autres organisations via les outils AI (qui ont accès à la DB), manipulation du comportement de l'agent.

**Preuve :**
```javascript
// aiAssistant.routes.js - aucun filtrage des rôles
const { messages } = req.body; // messages peut contenir role: "system"

// ai.service.js ligne 194
const currentMessages = [systemPrompt, ...messages]; // messages non filtrés
```

**Correction :**
```javascript
const safeMessages = messages.filter(m => m.role !== 'system').slice(-20);
```

---

## 3. ⚠️ RISQUES MAJEURS (P1)

### P1-1 — Onboarding : DDL dynamique en route applicative
**Fichier :** `backend/src/routes/onboarding.routes.js` lignes 33-35

**Description :** La route `/api/onboarding/setup` exécute des `ALTER TABLE` en production à chaque appel si les colonnes n'existent pas. Aucun rôle admin requis.

**Impact :** Modification du schéma DB en production via une requête HTTP authentifiée (mais sans vérification de rôle admin). Race condition possible. Incompatible avec les pratiques de migration contrôlée.

**Preuve :**
```javascript
await client.query(`ALTER TABLE organisations ADD COLUMN IF NOT EXISTS adresse TEXT;`);
await client.query(`ALTER TABLE organisations ADD COLUMN IF NOT EXISTS tax_numbers TEXT;`);
```

**Correction :** Migrer ces colonnes dans une migration SQL dédiée. Supprimer le DDL dynamique de la route.

---

### P1-2 — `requireRole` : Rôle global vs rôle organisationnel non distingués
**Fichier :** `backend/src/middleware/requireRole.js`

**Description :** Le middleware vérifie `req.user.role` (rôle global JWT) mais le commentaire dans le code lui-même reconnaît que ce rôle est "global système" et non "rôle dans l'organisation courante". Un utilisateur `admin` d'une org A pourrait théoriquement accéder à des routes admin d'une org B si le JWT est compromis ou mal émis.

**Impact :** Absence de RBAC per-organisation. Le rôle `admin` est binaire et global.

**Correction :** Implémenter `role_org` par organisation (colonne déjà présente dans `utilisateurs`). Créer `requireOrgRole()` distinct de `requireRole()`.

---

### P1-3 — `requireSuperAdmin` : Basé sur une liste d'IDs en env var
**Fichier :** `backend/src/middleware/requireSuperAdmin.js`

**Description :** Le super-admin est identifié par `MASTER_ADMIN_USER_IDS` (liste d'IDs numériques en env var). Pas de colonne DB dédiée, pas de rotation possible sans redéploiement.

**Impact :** Si un ID super-admin est compromis, révocation impossible sans redéploiement. Pas d'audit trail sur les changements de la liste.

**Correction :** Migrer vers un rôle `super_admin` en DB avec audit trail. La note dans le code le mentionne déjà.

---

### P1-4 — `organisations.routes.js` : Rôle `administrateur` non documenté
**Fichier :** `backend/src/routes/organisations.routes.js` ligne 13

**Description :** Ce router utilise `requireRole("administrateur")` (avec un 'r' final) — différent de `"admin"`. Ce rôle n'est pas documenté dans le système de rôles. Aucun utilisateur ne semble avoir ce rôle en production.

**Impact :** Les routes `GET /api/organisations`, `POST /api/organisations`, `PATCH /api/organisations/:id` sont probablement inaccessibles (403 permanent) ou accessibles à un rôle fantôme.

**Preuve :**
```javascript
router.use(requireRole("administrateur")); // "administrateur" vs "admin"
```

---

### P1-5 — `dataRetention.js` : Suppression physique sans organisation_id scope
**Fichier :** `backend/src/jobs/dataRetention.js` lignes 168-177

**Description :** La purge des soft-deleted records (`time_entries`, `projets`, `clients`, `utilisateurs`, `invoices`) utilise `DELETE FROM ${table} WHERE deleted_at < NOW() - INTERVAL '90 days'` sans scope par `organisation_id`. C'est un scan global.

**Impact :** Comportement attendu pour un job système, mais si la table `utilisateurs` est purgée globalement, des utilisateurs d'organisations actives pourraient être supprimés si `deleted_at` est mal positionné.

**Correction :** Ajouter `AND organisation_id IS NOT NULL` comme garde-fou minimum.

---

### P1-6 — `analytics.routes.js` : `event_name` non validé (injection libre)
**Fichier :** `backend/src/routes/analytics.routes.js` lignes 56-68

**Description :** Le `event_name` envoyé par le client est inséré directement en DB sans whitelist ni validation de longueur/format.

**Impact :** Pollution de la table `analytics_events` avec des noms d'événements arbitraires. Potentiel pour des attaques de type "event flooding" ou injection de données analytics.

**Preuve :**
```javascript
const { event_name, metadata = {} } = req.body;
// Aucune validation de event_name
await analyticsService.trackEvent(event_name, {...});
```

**Correction :**
```javascript
const ALLOWED_FRONTEND_EVENTS = ['page_view', 'button_click', 'feature_used', ...];
if (!ALLOWED_FRONTEND_EVENTS.includes(event_name)) return res.status(400)...
```

---

### P1-7 — `hub.socket.js` : Log du cookie complet en cas d'échec d'auth
**Fichier :** `backend/src/socket/hub.socket.js` lignes 50-53

**Description :** En cas d'échec d'authentification socket, le code log `socket.handshake.headers.cookie` — ce qui inclut potentiellement le `refresh_token` httpOnly.

**Impact :** Fuite de refresh token dans les logs système (Winston/Sentry).

**Preuve :**
```javascript
console.log("Socket auth failed:", {
  token: !!token,
  cookie: socket.handshake.headers.cookie, // DANGER: refresh_token visible
});
```

**Correction :** Supprimer ce log ou masquer le cookie : `cookie: '[redacted]'`.

---

### P1-8 — `auth.service.js` / `masteradmin.service.js` : bcrypt hardcodé à 10 rounds
**Fichiers :** `backend/src/services/auth.service.js` ligne 381, `backend/src/services/masteradmin.service.js` ligne 10

**Description :** `signupUser` et `createClientOrganisation` utilisent `bcrypt.hash(password, 10)` hardcodé, ignorant `BCRYPT_SALT_ROUNDS` de `config/security.js` (qui monte à 12 en production).

**Impact :** Mots de passe hashés avec 10 rounds en production au lieu de 12. Résistance brute-force réduite.

**Correction :** Utiliser `const { BCRYPT_SALT_ROUNDS } = require('../config/security')` dans ces deux fichiers.

---

## 4. 📋 RISQUES MINEURS (P2)

### P2-1 — `organisation.js` : `parseInt(req.query.limit)` sans borne max
**Fichier :** `backend/src/routes/organisation.js` lignes 51-52

Un attaquant peut passer `limit=999999` pour extraire tous les audit logs en une requête. Ajouter `Math.min(limit, 100)`.

### P2-2 — `portal.routes.js` : `console.error` au lieu de `logger`
**Fichier :** `backend/src/routes/portal.routes.js`

Utilise `console.error` au lieu du logger structuré Winston. Les erreurs du portail public ne sont pas tracées avec `requestId`/`orgId`.

### P2-3 — `hub.routes.js` : `console.error` au lieu de `logger`
**Fichier :** `backend/src/routes/hub.routes.js`

11 occurrences de `console.error(e)` sans contexte structuré (pas de requestId, orgId, userId).

### P2-4 — `onboarding.routes.js` : Aucun `requireRole` sur les routes sensibles
**Fichier :** `backend/src/routes/onboarding.routes.js`

Les routes `/setup` et `/sample-data` sont protégées par `auth` mais pas par `requireRole("admin")`. N'importe quel utilisateur authentifié peut créer des données de démo ou modifier le nom de l'organisation.

### P2-5 — `dataRetention.js` : `dropExpiredPartitions` utilise interpolation de nom de table
**Fichier :** `backend/src/jobs/dataRetention.js` ligne 80

```javascript
await client.query(`DROP TABLE IF EXISTS ${row.name}`);
```
Le nom de partition vient d'une requête `pg_class` — risque théorique si un attaquant peut créer des tables avec des noms malicieux. Faible risque en pratique mais à noter.

### P2-6 — `validateEnv.js` : `DATABASE_URL` non validé en profondeur
**Fichier :** `backend/src/config/validateEnv.js`

`DATABASE_URL` est accepté sans validation du format (pas de vérification `postgresql://`). Une URL malformée ne sera détectée qu'au premier accès DB.

### P2-7 — `config/socket.js` : Fichier orphelin avec `console.log` de userId
**Fichier :** `backend/src/config/socket.js`

Ce fichier semble être une version ancienne/alternative de `hub.socket.js`. Il log `User ${socket.userId} connected` avec `console.log`. À supprimer ou migrer vers le logger structuré.

### P2-8 — `ai.service.js` : `categorizeActivitiesBatch` — condition RLS partielle
**Fichier :** `backend/src/services/ai.service.js` ligne 343

```sql
WHERE id = $2 AND (organisation_id = $3 OR organisation_id IS NULL)
```
La clause `OR organisation_id IS NULL` permet de modifier des enregistrements sans organisation. À supprimer.

---

## 5. ✅ POINTS POSITIFS (ce qui fonctionne bien)

| Domaine | Statut |
|---------|--------|
| RLS PostgreSQL | ✅ Appliqué sur toutes les tables métier (migrations 038, 059) |
| Middleware `requireOrganisation` | ✅ Injecte le contexte RLS via `set_config` LOCAL |
| JWT : algorithme fixé à HS256 | ✅ `algorithms: ["HS256"]` dans verify |
| Refresh token rotation | ✅ Implémenté avec `FOR UPDATE`, révocation, session tracking |
| Cookies httpOnly + secure en prod | ✅ `buildCookieOptions()` correct |
| Rate limiting par organisation | ✅ `orgKeyGenerator` + `OrganisationStore` |
| Helmet + CSP | ✅ Configuré avec directives strictes |
| CORS whitelist | ✅ Strict en production, Vercel previews autorisés |
| Electron : `contextIsolation: true`, `nodeIntegration: false` | ✅ Toutes les fenêtres |
| Electron : `contextBridge` whitelist | ✅ `preload.js` expose uniquement les IPC nécessaires |
| Validation Zod sur les routes critiques | ✅ Invoices, users, estimates, master-admin |
| Audit trail `business_audit_logs` | ✅ Sur les actions sensibles (user.deleted, role_changed, org_created) |
| `requireSuperAdmin` fail-secure | ✅ Bloque si `MASTER_ADMIN_USER_IDS` absent |
| `systemConsistencyJob` : notifications cross-tenant corrigées | ✅ Fix P1 2026-06-24 |
| `dataRetention` : audit logs globaux corrigés | ✅ Fix P2 2026-06-24 |
| `recurringInvoiceJob` : FK composite cross-org | ✅ Migration 062 + guard applicatif |
| Stripe webhook : signature vérifiée | ✅ `constructEvent` avec secret |
| Kiosk punch : PIN hashé bcrypt | ✅ `verifyKioskUser` avec `bcrypt.compare` |
| Error handler : stack trace masqué en prod | ✅ `isDev` check |
| Sentry intégré | ✅ `setupExpressErrorHandler` |

---

## 6. 🔧 CHECKLIST DE FIX PRIORITAIRE

### 🔴 IMMÉDIAT (P0 — avant prochain déploiement)

| # | Action | Fichier | Effort |
|---|--------|---------|--------|
| 1 | Remplacer `req.user.organisationId` → `req.user.organisation_id` | `hub.routes.js` | 5 min |
| 2 | Remplacer `io.emit(...)` → `io.of('/hub').to('org_${orgId}').emit(...)` | `hub.routes.js` | 15 min |
| 3 | Corriger `user.organisationId` → `user.organisation_id` dans socket | `hub.socket.js` | 5 min |
| 4 | Fail-secure CORS Socket.IO si `FRONTEND_URL` absent | `server.js` | 5 min |
| 5 | Filtrer `role: "system"` des messages AI client | `aiAssistant.routes.js` + `ai.service.js` | 10 min |

### 🟠 URGENT (P1 — dans les 7 jours)

| # | Action | Fichier | Effort |
|---|--------|---------|--------|
| 6 | Supprimer DDL dynamique de l'onboarding → migration SQL | `onboarding.routes.js` | 30 min |
| 7 | Corriger bcrypt rounds hardcodés → `BCRYPT_SALT_ROUNDS` | `auth.service.js`, `masteradmin.service.js` | 10 min |
| 8 | Supprimer log cookie dans socket auth failed | `hub.socket.js` | 2 min |
| 9 | Ajouter whitelist `event_name` sur `/api/analytics/track` | `analytics.routes.js` | 15 min |
| 10 | Clarifier/corriger rôle `"administrateur"` vs `"admin"` | `organisations.routes.js` | 10 min |

### 🟡 PLANIFIÉ (P2 — dans les 30 jours)

| # | Action | Fichier | Effort |
|---|--------|---------|--------|
| 11 | Ajouter `requireRole("admin")` sur `/onboarding/setup` et `/sample-data` | `onboarding.routes.js` | 5 min |
| 12 | Borner `limit` à 100 max dans audit-logs | `organisation.js` | 5 min |
| 13 | Migrer `console.error` → `logger` dans hub et portal | `hub.routes.js`, `portal.routes.js` | 20 min |
| 14 | Supprimer `OR organisation_id IS NULL` dans AI categorize | `ai.service.js` | 5 min |
| 15 | Supprimer/migrer `config/socket.js` orphelin | `config/socket.js` | 10 min |

---

## 7. 🏗️ RECOMMANDATIONS ARCHITECTURALES

### 7.1 — Migrer SuperAdmin vers un rôle DB
Actuellement `MASTER_ADMIN_USER_IDS` en env var. Créer une colonne `is_super_admin BOOLEAN DEFAULT false` dans `utilisateurs` avec migration + audit trail. Permet la révocation sans redéploiement.

### 7.2 — Implémenter RBAC per-organisation
La colonne `role_org` existe déjà dans `utilisateurs`. Créer `requireOrgRole(role)` qui vérifie ce champ après avoir chargé l'utilisateur depuis la DB (pas seulement depuis le JWT). Cela permettra des rôles différents par organisation pour un même utilisateur.

### 7.3 — Centraliser la validation des messages AI
Créer un `aiMessageSchema` Zod qui valide : `role` ∈ `["user", "assistant"]`, `content` string max 2000, tableau max 20 messages. Appliquer dans la route avant d'appeler le service.

### 7.4 — Séparer les jobs système des jobs tenant
Les jobs comme `systemConsistencyJob` et `dataRetention` opèrent sur des données cross-tenant. Ils doivent être clairement documentés comme "system-level" et leurs résultats ne doivent jamais être exposés aux admins d'organisation (déjà corrigé pour les notifications, à maintenir).

### 7.5 — Ajouter un rate limit sur le portail public
`/api/portal/:token` est public et non rate-limité individuellement. Ajouter un limiter spécifique (ex: 10 req/min par IP) pour prévenir l'énumération de tokens.

### 7.6 — Audit trail sur les actions AI
Les actions exécutées par le Copilot AI (création de clients, factures, etc.) via `aiToolsService.executeToolCall` ne génèrent pas d'audit trail distinct. Ajouter un log `ai_copilot.action_executed` dans `business_audit_logs`.

### 7.7 — Valider `FRONTEND_URL` au démarrage
Ajouter `FRONTEND_URL` à `requiredEnvVars` dans `validateEnv.js` pour éviter le fallback `*` en production.

### 7.8 — Considérer un token de portail signé (HMAC)
Les tokens de portail client (`/api/portal/:token`) sont des UUIDs aléatoires. Envisager des tokens HMAC signés avec expiration courte pour les liens de paiement.

---

## 8. RÉSUMÉ EXÉCUTIF

| Catégorie | Nb risques | Criticité |
|-----------|-----------|-----------|
| P0 Critiques | 5 | 🔴 Bloquer déploiement |
| P1 Majeurs | 8 | 🟠 Corriger sous 7 jours |
| P2 Mineurs | 8 | 🟡 Planifier sous 30 jours |

**Les 3 risques les plus urgents :**
1. **Hub routes cassées** (P0-1, P0-2, P0-3) : Le module Hub entier est non-fonctionnel ET expose des données cross-tenant via Socket.IO global broadcast.
2. **AI Prompt Injection** (P0-5) : Un utilisateur peut injecter des instructions système dans le Copilot qui a accès à la DB.
3. **Socket.IO CORS wildcard** (P0-4) : Si `FRONTEND_URL` absent en prod, toutes origines acceptées.

**Ce qui protège déjà bien le système :**
- RLS PostgreSQL cohérent sur toutes les tables métier
- Middleware `requireOrganisation` avec `set_config LOCAL` (isolation correcte)
- Refresh token rotation avec révocation
- Electron sécurisé (contextIsolation, no nodeIntegration)
- Stripe webhook signature vérifiée
- Error handler sans stack trace en production

---

*Rapport généré le 2026-06-24 — Basé sur analyse statique du code source. Ne remplace pas un pentest dynamique.*
