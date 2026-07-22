# MADSuite — Staging Configuration Readiness

**Date** : 15 juillet 2026, 15:47 UTC-4  
**Statut** : READY TO DEPLOY STAGING (avec confirmations requises)

---

## 1. Accès

### Vercel CLI
- ✅ Installé : Vercel CLI 54.14.2
- ✅ Authentifié : Oui (info-10990258)
- ✅ Projet lié : Oui (madsuite)
- **Détails masqués** : projectId et orgId présents dans `.vercel/project.json`

### Railway CLI
- ❌ Installé : Non (command not found)
- **Installation requise** : https://docs.railway.app/guides/cli
- **Commande Windows** : `npm install -g @railway/cli` ou `winget install Railway.Railway`

---

## 2. Base de Données

### Options disponibles

#### Option A : PostgreSQL Railway (recommandée)
- Créé automatiquement lors du déploiement Railway
- DATABASE_URL fourni par Railway
- SSL activé par défaut
- Backup automatique inclus
- Coût : inclus dans le plan Railway

#### Option B : Neon PostgreSQL (alternative)
- Création manuelle sur https://neon.tech
- DATABASE_URL : `postgresql://user:password@host/database?sslmode=require`
- Backup manuel ou automatique (plan payant)
- Coût : gratuit jusqu'à 3 projets, puis payant

### Prérequis
- ❌ DATABASE_URL staging : Non fournie (à obtenir après création)
- ✅ Migrations prêtes : Oui (28 fichiers SQL versionnés)
- ✅ Backup requis : Oui (avant première migration)

---

## 3. Railway Backend

### Configuration

**Root directory** : `backend/`

**Build command** : `npm install`

**Start command** : `node server.js`

**Healthcheck** : `GET /api/health` (sans authentification)

**Port** : Écoute sur `process.env.PORT` (flexible)

### Variables d'environnement requises

| Variable | Obligatoire | Secrète | Exemple | Source |
|----------|-------------|---------|---------|--------|
| `NODE_ENV` | ✅ | ❌ | `staging` | Code |
| `PORT` | ❌ | ❌ | `5000` | Code (défaut) |
| `DATABASE_URL` | ✅ | ✅ | `postgresql://...` | Railway ou Neon |
| `JWT_SECRET` | ✅ | ✅ | `<64-char-hex>` | À générer |
| `ACCESS_TOKEN_EXPIRES_IN` | ❌ | ❌ | `1h` | `.env.example` |
| `REFRESH_TOKEN_EXPIRES_IN` | ❌ | ❌ | `30d` | `.env.example` |
| `FRONTEND_URL` | ✅ | ❌ | `https://project-0mkvo.vercel.app/` | À fournir |
| `VERCEL_FRONTEND_URL` | ❌ | ❌ | `https://<PREVIEW_URL>` | Optionnel |
| `ALLOWED_CORS_ORIGINS` | ❌ | ❌ | `https://<VERCEL_URL>` | Optionnel |
| `REFRESH_COOKIE_SAMESITE` | ❌ | ❌ | `lax` ou `strict` | Code (défaut strict) |
| `STRIPE_SECRET_KEY` | ❌ | ✅ | `sk_test_...` | Stripe test |
| `STRIPE_WEBHOOK_SECRET` | ❌ | ✅ | `whsec_...` | Stripe test |
| `SENTRY_DSN` | ❌ | ❌ | `https://...@sentry.io/...` | Optionnel |
| `REDIS_URL` | ❌ | ❌ | `redis://...` | Optionnel |
| `REDIS_DISABLED` | ❌ | ❌ | `true` | `.env.example` |
| `SCHEDULERS_ENABLED` | ❌ | ❌ | `true` | `.env.example` |
| `SKIP_MIGRATIONS` | ❌ | ❌ | `0` | `.env.example` |
| `ENABLE_DB_BACKUP` | ❌ | ❌ | `1` | `.env.example` |

### Blocages identifiés
- ❌ Railway CLI non installé (requis pour déploiement local)
- ❌ DATABASE_URL non fournie
- ❌ JWT_SECRET non généré
- ❌ FRONTEND_URL non attribuée (dépend de Vercel)

---

## 4. Vercel Frontend

### Configuration

**Root directory** : `frontend/`

**Build command** : `npm install && npm run build` (configuré dans `vercel.json`)

**Output directory** : `frontend/build`

**Fallback SPA** : ✅ Configuré dans `vercel.json` (rewrites)

**Node version** : À vérifier dans `package.json` (actuellement non spécifié)

### Variables d'environnement requises

| Variable | Obligatoire | Secrète | Exemple | Source |
|----------|-------------|---------|---------|--------|
| `VITE_API_URL` | ✅ | ❌ | `madsuite-backend-production.up.railway.app` | À fournir |
| `VITE_APP_ENV` | ✅ | ❌ | `staging` | Code |
| `VITE_APP_NAME` | ❌ | ❌ | `MADSuite` | `.env.example` |
| `VITE_PUBLIC_SITE_URL` | ✅ | ❌ | `https://project-0mkvo.vercel.app/` | À fournir |
| `VITE_STRIPE_PUBLIC_KEY` | ❌ | ❌ | `pk_test_...` | Stripe test |
| `VITE_ENABLE_COGNITIVE_PANEL` | ❌ | ❌ | `false` | `.env.example` |
| `VITE_ENABLE_REVENUE_FUNNEL` | ❌ | ❌ | `true` | `.env.example` |
| `VITE_ENABLE_MODULES` | ❌ | ❌ | `true` | `.env.example` |
| `VITE_ENABLE_KIOSK` | ❌ | ❌ | `true` | `.env.example` |
| `VITE_SENTRY_DSN` | ❌ | ❌ | `https://...@sentry.io/...` | Optionnel |
| `VITE_TEST_MODE` | ❌ | ❌ | `false` | `.env.example` |
| `GENERATE_SOURCEMAP` | ❌ | ❌ | `false` | `.env.example` |

### Blocages identifiés
- ❌ VITE_API_URL non fournie (dépend de Railway)
- ❌ VITE_PUBLIC_SITE_URL non attribuée (dépend de Vercel)
- ⚠️ Node version non spécifiée (à vérifier)

---

## 5. CORS et Cookies

### Configuration attendue

**Origine frontend** : `https://project-0mkvo.vercel.app/` (à attribuer par Vercel)

**Origine backend** : `madsuite-backend-production.up.railway.app` (à attribuer par Railway)

**Credentials** : ✅ Activés (`withCredentials: true` frontend, `credentials: true` backend)

**SameSite** : `strict` (défaut, configurable via `REFRESH_COOKIE_SAMESITE`)

**Secure** : ✅ Activé en production (HTTPS)

### Risque identifié

⚠️ **SameSite=Strict peut bloquer le refresh token** si le frontend et le backend sont sur des domaines différents (ce qui est le cas : Vercel vs Railway).

**Recommandation** : Tester avec `SameSite=Lax` en staging pour permettre les requêtes cross-site.

**Configuration à valider** :
```javascript
// backend/src/routes/login.js
sameSite: process.env.REFRESH_COOKIE_SAMESITE || "strict"
// Passer à "lax" en staging si les cookies ne sont pas transmis
```

---

## 6. Migrations

### Commande d'exécution
```bash
npm run db:migrate
```

### Ordre
- 28 fichiers SQL numérotés (024, 027, 029, 030, ..., 048)
- Exécutés dans l'ordre numérique
- Table `schema_migrations` créée automatiquement

### Migrations destructives
- ⚠️ À identifier dans le code (DROP TABLE, ALTER COLUMN, etc.)
- Aucune détectée dans les noms de fichiers
- À vérifier avant déploiement

### Stratégie
- ✅ Backup requis avant migration (`ENABLE_DB_BACKUP=1`)
- ❌ Rollback : Migrations non réversibles (pas de DOWN)
- ✅ Exécution : Automatique au démarrage (sauf `SKIP_MIGRATIONS=1`)

---

## 7. Génération sécurisée des secrets

### JWT_SECRET (32 bytes = 64 hex chars)

**Commande Node** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Commande PowerShell** :
```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Utilisation** :
1. Exécuter la commande localement
2. Copier la valeur
3. Coller directement dans Railway (variables d'environnement)
4. **NE PAS** commiter dans Git

### Stripe (test mode uniquement)

**Clés test** :
- Public key : `pk_test_...` (visible)
- Secret key : `sk_test_...` (secret)
- Webhook secret : `whsec_...` (secret)

**Obtention** :
1. Créer un compte Stripe test
2. Aller à https://dashboard.stripe.com/test/apikeys
3. Copier les clés test
4. Configurer dans Railway

---

## 8. Commandes de validation

### Backend

**Healthcheck** :
```bash
curl -X GET https://<RAILWAY_STAGING_URL>/api/health
```

**Réponse attendue** :
```json
{
  "success": true,
  "code": "HEALTH_OK",
  "data": {
    "status": "ok",
    "database": "ok",
    "environment": "staging"
  }
}
```

**Logs** :
```bash
railway logs
```

**Migration status** :
```bash
# Vérifier que les migrations sont appliquées
# Accéder à la base et vérifier la table schema_migrations
```

**Signup test** :
```bash
curl -X POST https://<RAILWAY_STAGING_URL>/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "organisation_nom": "Test Org",
    "user_nom": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Refresh test** :
```bash
# Après signup, tester POST /api/refresh avec le refresh_token en cookie
```

### Frontend

**Chargement** :
```bash
curl -X GET https://<VERCEL_STAGING_URL>/
```

**Erreurs console** :
- Ouvrir https://<VERCEL_STAGING_URL>
- Ouvrir DevTools (F12)
- Vérifier l'onglet Console

**Appels réseau** :
- Onglet Network
- Vérifier que les requêtes vers `/api` vont vers `https://<RAILWAY_STAGING_URL>/api`

**Navigation SPA** :
- Cliquer sur les liens
- Vérifier que la page ne recharge pas (SPA)
- Vérifier que les routes protégées redirigent vers login

### E2E Staging

**Configuration** :
```bash
cd e2e
export TEST_BASE_URL=https://<VERCEL_STAGING_URL>
export TEST_API_URL=https://<RAILWAY_STAGING_URL>/api
npm run test:critical:full
```

**Résultats attendus** :
- Chromium desktop : PASS
- Chromium mobile : PASS
- WebKit mobile : PASS
- Code de sortie : 0

---

## 9. Informations encore requises

### Accès
- ❌ Railway CLI installé et authentifié
- ✅ Vercel CLI installé et authentifié

### Projets
- ✅ Vercel : Projet `madsuite` lié
- ❌ Railway : Projet staging à créer ou confirmer

### Base de données
- ❌ DATABASE_URL staging (Railway ou Neon)
- ❌ Confirmation de l'option (Railway vs Neon)

### Clés Stripe test
- ❌ `STRIPE_SECRET_KEY` (sk_test_...)
- ❌ `STRIPE_WEBHOOK_SECRET` (whsec_...)

### Secrets JWT
- ❌ `JWT_SECRET` (à générer)

### URLs attribuées
- ❌ URL frontend staging (Vercel)
- ❌ URL backend staging (Railway)

---

## 10. Verdict

### ✅ READY TO DEPLOY STAGING

**Conditions** :
1. ✅ Préflight fermé (commit 777f3df publié)
2. ✅ Vercel CLI authentifié
3. ✅ Projet Vercel lié
4. ❌ Railway CLI à installer
5. ❌ Projet Railway à créer/confirmer
6. ❌ DATABASE_URL à fournir
7. ❌ Secrets JWT à générer
8. ❌ Clés Stripe test à fournir
9. ❌ URLs staging à attribuer

### Prochaines étapes

1. **Installer Railway CLI** :
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Créer/confirmer le projet Railway** :
   ```bash
   railway init
   ```

3. **Créer la base PostgreSQL** :
   - Option A : Railway PostgreSQL (automatique)
   - Option B : Neon PostgreSQL (manuel)

4. **Générer les secrets** :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Configurer les variables Railway** :
   - NODE_ENV=staging
   - DATABASE_URL=<obtenu>
   - JWT_SECRET=<généré>
   - FRONTEND_URL=<attribué par Vercel>
   - Autres variables selon `.env.example`

6. **Configurer les variables Vercel** :
   - VITE_API_URL=<attribué par Railway>
   - VITE_PUBLIC_SITE_URL=<attribué par Vercel>
   - Autres variables selon `.env.example`

7. **Déployer le backend** :
   ```bash
   railway up
   ```

8. **Déployer le frontend** :
   ```bash
   vercel --prod
   ```

9. **Exécuter les tests E2E** :
   ```bash
   cd e2e
   TEST_BASE_URL=<VERCEL_URL> TEST_API_URL=<RAILWAY_URL>/api npm run test:critical:full
   ```

10. **Valider le flux utilisateur** :
    - Signup
    - Login
    - Refresh token
    - Logout
    - Isolation multi-tenant

---

**Responsable** : Cline (AI Assistant)  
**Dernière mise à jour** : 15 juillet 2026, 15:47 UTC-4  
**Commit** : 777f3df (docs(staging): add deployment preparation and preflight guides)
