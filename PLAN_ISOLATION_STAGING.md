# MADSuite — Plan d'Isolation Staging

**Date** : 15 juillet 2026, 20:08 UTC-4  
**Statut** : READY TO CREATE STAGING (avec confirmations requises)

---

## 1. Production Détectée

### Backend
```
https://madsuite-backend-production.up.railway.app
```

### Environnement
```
"environment": "production"
```

### Base protégée
✅ **OUI** : Base de données connectée et active

### E2E autorisé
❌ **NON** : Environnement production confirmé

### Interdictions absolues
- ❌ Ne pas lancer de tests E2E sur ce backend
- ❌ Ne pas créer d'utilisateurs de test
- ❌ Ne pas modifier les variables du service production
- ❌ Ne pas lancer de migrations
- ❌ Ne pas remplacer DATABASE_URL
- ❌ Ne pas modifier Stripe, les courriels ou les cron jobs

---

## 2. Railway Staging — Stratégies

### Option A : Nouvel Environnement dans le Même Projet

**Avantages** :
- ✅ Partage la même infrastructure
- ✅ Gestion centralisée
- ✅ Coût réduit

**Inconvénients** :
- ⚠️ Risque de confusion entre production et staging
- ⚠️ Partage potentiel de ressources

**Configuration** :
```
Projet : madsuite-backend-production (existant)
Environnement : staging (nouveau)
Service backend : backend-staging (nouveau)
PostgreSQL : postgres-staging (nouveau)
Domaine : madsuite-backend-staging.up.railway.app
```

### Option B : Nouveau Projet Railway Séparé

**Avantages** :
- ✅ Isolation totale
- ✅ Pas de risque de confusion
- ✅ Gestion indépendante

**Inconvénients** :
- ⚠️ Coût potentiellement plus élevé
- ⚠️ Gestion de deux projets

**Configuration** :
```
Projet : MADSuite Staging (nouveau)
Environnement : production (dans le projet staging)
Service backend : backend (nouveau)
PostgreSQL : postgres (nouveau)
Domaine : madsuite-backend-staging.up.railway.app
```

### Recommandation
**Option B (Nouveau Projet Séparé)** est recommandée pour :
- Isolation maximale
- Sécurité accrue
- Pas de risque de contamination production

---

## 3. PostgreSQL Staging

### Isolation requise
✅ **Base entièrement séparée** de la production

### Interdictions
- ❌ Ne pas utiliser la DATABASE_URL de production
- ❌ Ne pas utiliser E2E_DATABASE_URL locale
- ❌ Ne pas copier les données de production sans anonymisation
- ❌ Ne pas exécuter de suppression sur une base existante

### Configuration
```
Fournisseur : PostgreSQL Railway (recommandé)
Nom : madsuite_staging
SSL : Activé
Backup : Automatique (Railway)
Données : Jetables
Migrations : À appliquer depuis zéro
```

### Récupération de DATABASE_URL
```bash
# Après création du service PostgreSQL
railway variables
# Copier la valeur de DATABASE_URL
# NE PAS l'afficher dans les logs ou le chat
```

---

## 4. Variables Staging

### Obligatoires

| Variable | Valeur | Secrète | Source |
|----------|--------|---------|--------|
| `NODE_ENV` | `staging` | ❌ | Code |
| `DATABASE_URL` | `<RAILWAY_STAGING_DATABASE_URL>` | ✅ | Railway |
| `JWT_SECRET` | `<GENERATED_STAGING_SECRET>` | ✅ | À générer |
| `JWT_REFRESH_SECRET` | `<GENERATED_STAGING_REFRESH_SECRET>` | ✅ | À générer |
| `FRONTEND_URL` | `<VERCEL_STAGING_URL>` | ❌ | Vercel |
| `CORS_ORIGINS` | `<VERCEL_STAGING_URL>` | ❌ | Vercel |

### Cookies (Cross-Site)

**Configuration pour HTTPS cross-site** :
```
COOKIE_SECURE=true
COOKIE_SAMESITE=none
```

**Raison** : Frontend (Vercel) et Backend (Railway) sont sur des domaines différents.

**Attention** : `SameSite=Lax` ou `Strict` peut empêcher le refresh token sur des requêtes cross-site XHR.

### Stripe (Test Mode Uniquement)

```
STRIPE_SECRET_KEY=sk_test_<TEST_KEY>
STRIPE_WEBHOOK_SECRET=whsec_<TEST_SECRET>
```

**Interdictions** :
- ❌ Ne jamais utiliser `sk_live_*`
- ❌ Ne jamais inventer une clé
- ❌ Ne jamais utiliser les clés de production

**Si aucune clé test disponible** :
- Désactiver les fonctions Stripe staging
- Marquer comme non testable
- Documenter la limitation

### Courriels

**Stratégies** :
1. **Provider Sandbox** : Mailgun, SendGrid, etc. en mode test
2. **Adresse de Redirection** : Tous les emails vers une adresse unique
3. **Envoi Désactivé** : `MAIL_DISABLED=true`
4. **Logger Local** : Logs sans envoi réel

**Interdictions** :
- ❌ Ne pas envoyer vers de vrais utilisateurs
- ❌ Ne pas utiliser les paramètres de production

### Cron et Workers

**En Staging** :
- ❌ Désactiver les tâches dangereuses
- ❌ Désactiver le dunning réel
- ❌ Désactiver les factures récurrentes envoyées
- ❌ Désactiver les notifications externes
- ✅ Conserver seulement les jobs requis pour le test

**Configuration** :
```
SCHEDULERS_ENABLED=true (ou false selon les besoins)
TRIAL_REMINDER_JOB_ENABLED=false
RETENTION_JOB_ENABLED=false
```

---

## 5. Frontend Vercel Staging

### Projet ou Preview
**Options** :
1. **Preview Environment** : Branche dédiée `staging`
2. **Projet Distinct** : Nouveau projet Vercel `madsuite-staging`

**Recommandation** : Projet distinct pour isolation maximale

### Configuration
```
Projet : madsuite-staging (nouveau)
Branche : staging (ou main si projet dédié)
URL : https://madsuite-staging.vercel.app
API Cible : https://<BACKEND_RAILWAY_STAGING>/api
```

### Variables Vite
```
VITE_API_URL=https://<BACKEND_RAILWAY_STAGING>/api
VITE_APP_ENV=staging
VITE_PUBLIC_SITE_URL=https://madsuite-staging.vercel.app
VITE_STRIPE_PUBLIC_KEY=pk_test_<TEST_KEY>
```

### Interdictions
- ❌ Ne pas placer de secrets backend dans les variables VITE_*
- ❌ Ne pas utiliser les clés Stripe de production

---

## 6. Sécurité Staging

### Stripe
```
Mode : Test uniquement
Clés : sk_test_*, pk_test_*
Webhooks : Sandbox
Paiements : Non réels
```

### Courriels
```
Stratégie : Sandbox ou redirection
Destinataires : Adresse unique ou logs
Notifications : Désactivées vers l'extérieur
```

### Cron
```
Tâches dangereuses : Désactivées
Dunning : Désactivé
Factures récurrentes : Désactivées
Notifications : Désactivées
```

### Cookies
```
Secure : true (HTTPS)
SameSite : none (cross-site)
HttpOnly : true
Path : /
Domain : <RAILWAY_STAGING_DOMAIN>
```

### CORS
```
Origine autorisée : https://<VERCEL_STAGING_URL>
Credentials : true
Pas de wildcard
```

---

## 7. Ordre de Création

**Après confirmation de l'utilisateur** :

1. ✅ Installer Railway CLI
2. ✅ Authentifier Railway CLI
3. ✅ Créer l'environnement ou projet Railway staging
4. ✅ Créer PostgreSQL staging
5. ✅ Récupérer DATABASE_URL (sans l'afficher)
6. ✅ Configurer les secrets staging
7. ✅ Déployer le backend staging
8. ✅ Appliquer les migrations
9. ✅ Vérifier `/api/health`
10. ✅ Créer/configurer Vercel staging
11. ✅ Configurer CORS avec l'URL Vercel exacte
12. ✅ Vérifier les cookies
13. ✅ Exécuter un signup manuel jetable
14. ✅ Exécuter la matrice E2E staging

---

## 8. Validation Avant E2E

**Avant de lancer Playwright, prouver** :

- [ ] `NODE_ENV` n'est pas `production`
- [ ] Base distincte de production
- [ ] Stripe utilise `sk_test_*` ou est désactivé
- [ ] Emails désactivés ou sandbox
- [ ] Cron dangereux désactivés
- [ ] Données jetables
- [ ] URL staging distinctes
- [ ] Healthcheck vert

**Si un seul point est inconnu** : Ne pas lancer les tests

---

## 9. Variables E2E Staging

**Une fois les services staging confirmés** :

```bash
export TEST_BASE_URL=https://<VERCEL_STAGING_URL>
export TEST_API_URL=https://<RAILWAY_STAGING_URL>/api
npm run test:critical:full
```

### Interdictions
- ❌ Ne pas configurer `E2E_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/madsuite_e2e` sur Railway ou Vercel
- ❌ Cette variable reste strictement locale

---

## 10. Informations Requises

### Confirmation
- [ ] Option A (nouvel environnement) ou Option B (nouveau projet) ?
- [ ] Accès Railway confirmé ?
- [ ] Clés Stripe test disponibles ?
- [ ] Stratégie courriel choisie ?
- [ ] Branche staging confirmée ?

### Avant Création
- [ ] Confirmation explicite de l'option Railway
- [ ] Accès Railway CLI authentifié
- [ ] Clés Stripe test (ou désactivation confirmée)
- [ ] Stratégie courriel définie
- [ ] Branche staging définie

---

## 11. Verdict

### ✅ READY TO CREATE STAGING

**Conditions** :
1. ✅ Production détectée et protégée
2. ✅ Audit non destructif complété
3. ✅ Plan d'isolation défini
4. ❌ Confirmation option A ou B requise
5. ❌ Accès Railway CLI requis
6. ❌ Clés Stripe test requises
7. ❌ Stratégie courriel requise

### Prochaines Étapes

1. **Confirmer l'option Railway** (A ou B)
2. **Installer Railway CLI** :
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. **Créer l'environnement staging**
4. **Créer PostgreSQL staging**
5. **Configurer les variables**
6. **Déployer le backend**
7. **Configurer Vercel staging**
8. **Valider les services**
9. **Exécuter les tests E2E**

---

**Responsable** : Cline (AI Assistant)  
**Dernière mise à jour** : 15 juillet 2026, 20:08 UTC-4  
**Audit** : Non destructif, lecture seule  
**Production** : Protégée, aucune modification
