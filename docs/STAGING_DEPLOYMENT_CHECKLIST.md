# MADSuite — Checklist Déploiement Staging

**Date** : 15 juillet 2026  
**Statut** : READY TO CONFIGURE STAGING

---

## 1. Prérequis

### Accès et authentification
- [ ] Accès Railway configuré (token/CLI)
- [ ] Accès Vercel configuré (token/CLI)
- [ ] Accès PostgreSQL staging (DATABASE_URL)
- [ ] Secrets JWT générés (JWT_SECRET, JWT_REFRESH_SECRET)
- [ ] Clés Stripe test disponibles (sk_test_*, pk_test_*)

### Domaines et URLs
- [ ] URL frontend staging attribuée par Vercel (ex: `<VERCEL_STAGING_URL>`)
- [ ] URL backend staging attribuée par Railway (ex: `<RAILWAY_STAGING_URL>`)
- [ ] Domaines CORS configurés
- [ ] Certificats HTTPS validés

### Dépôts Git
- [ ] Tous les dépôts synchronisés avec origin/main
- [ ] Aucun changement local non-commité
- [ ] Commits E2E, backend, frontend, global identifiés

---

## 2. Configuration Backend Railway

### Variables d'environnement
| Variable | Valeur | Obligatoire | Statut |
|----------|--------|-------------|--------|
| `NODE_ENV` | `staging` | ✅ | [ ] |
| `PORT` | `<RAILWAY_PORT>` | ❌ | [ ] |
| `DATABASE_URL` | `<POSTGRES_STAGING_URL>` | ✅ | [ ] |
| `JWT_SECRET` | `<GENERATED_SECRET>` | ✅ | [ ] |
| `JWT_REFRESH_SECRET` | `<GENERATED_SECRET>` | ❌ | [ ] |
| `ACCESS_TOKEN_EXPIRES_IN` | `1h` | ❌ | [ ] |
| `REFRESH_TOKEN_EXPIRES_IN` | `30d` | ❌ | [ ] |
| `FRONTEND_URL` | `<VERCEL_STAGING_URL>` | ✅ | [ ] |
| `VERCEL_FRONTEND_URL` | `<VERCEL_PREVIEW_URL>` | ❌ | [ ] |
| `ALLOWED_CORS_ORIGINS` | `<COMMA_SEPARATED>` | ❌ | [ ] |
| `REFRESH_COOKIE_SAMESITE` | `lax` ou `strict` | ❌ | [ ] |
| `STRIPE_SECRET_KEY` | `sk_test_...` | ❌ | [ ] |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ❌ | [ ] |
| `SENTRY_DSN` | `<OPTIONAL>` | ❌ | [ ] |
| `REDIS_URL` | `<OPTIONAL>` | ❌ | [ ] |
| `REDIS_DISABLED` | `true` | ❌ | [ ] |
| `SCHEDULERS_ENABLED` | `true` | ❌ | [ ] |
| `ENABLE_DB_BACKUP` | `1` | ❌ | [ ] |
| `SKIP_MIGRATIONS` | `0` | ❌ | [ ] |

### Commandes de démarrage
- [ ] Commande build : `node -c server.js`
- [ ] Commande start : `node server.js`
- [ ] Commande migration : `npm run db:migrate`
- [ ] Healthcheck : `GET /api/health` (sans authentification)

### Vérifications pré-déploiement
- [ ] Port écoute sur `process.env.PORT`
- [ ] Pas de port fixe en dur
- [ ] Healthcheck répond sans auth
- [ ] Migrations exécutées au démarrage
- [ ] Logs sans secret
- [ ] Graceful shutdown configuré

---

## 3. Configuration Frontend Vercel

### Variables d'environnement
| Variable | Valeur | Obligatoire | Statut |
|----------|--------|-------------|--------|
| `VITE_API_URL` | `<RAILWAY_STAGING_URL>/api` | ✅ | [ ] |
| `VITE_APP_ENV` | `staging` | ✅ | [ ] |
| `VITE_APP_NAME` | `MADSuite` | ❌ | [ ] |
| `VITE_PUBLIC_SITE_URL` | `<VERCEL_STAGING_URL>` | ✅ | [ ] |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_...` | ❌ | [ ] |
| `VITE_ENABLE_COGNITIVE_PANEL` | `false` | ❌ | [ ] |
| `VITE_ENABLE_REVENUE_FUNNEL` | `true` | ❌ | [ ] |
| `VITE_ENABLE_MODULES` | `true` | ❌ | [ ] |
| `VITE_ENABLE_KIOSK` | `true` | ❌ | [ ] |
| `VITE_SENTRY_DSN` | `<OPTIONAL>` | ❌ | [ ] |
| `VITE_TEST_MODE` | `false` | ❌ | [ ] |
| `GENERATE_SOURCEMAP` | `false` | ❌ | [ ] |

### Commandes de build
- [ ] Build command : `cd frontend && npm install && npm run build`
- [ ] Output directory : `frontend/build`
- [ ] Fallback SPA : ✅ Configuré dans `vercel.json`

### Vérifications pré-déploiement
- [ ] Vite build réussit localement
- [ ] Pas de secret backend dans les variables
- [ ] VITE_API_URL pointe vers staging
- [ ] Routes protégées redirigent vers login
- [ ] Pas d'erreur console en dev

---

## 4. PostgreSQL et Migrations

### Migrations disponibles
- [ ] 28 fichiers SQL détectés
- [ ] Numérotation séquentielle (024, 027, 029, 030, ...)
- [ ] Ordre chronologique validé
- [ ] Migrations destructives identifiées

### Commande de migration
```bash
npm run db:migrate
# ou
npm run deploy:migrate  # En production
```

### Vérifications
- [ ] Table `schema_migrations` créée
- [ ] Migrations appliquées dans l'ordre
- [ ] Pas d'erreur SQL
- [ ] Backup activé (`ENABLE_DB_BACKUP=1`)
- [ ] Rollback documenté

### Migrations destructives
- [ ] Aucune DROP TABLE détectée
- [ ] Aucun ALTER COLUMN destructif
- [ ] Stratégie de rollback définie

---

## 5. CORS et Authentification

### Configuration CORS Backend
```javascript
// Origines autorisées (staging)
- <VERCEL_STAGING_URL>
- <VERCEL_PREVIEW_URL> (si applicable)
- process.env.FRONTEND_URL
- process.env.VERCEL_FRONTEND_URL
```

### Cookies
```javascript
{
  httpOnly: true,
  secure: true,  // HTTPS en staging
  sameSite: "strict",  // ou "lax" si nécessaire
  path: "/",
  maxAge: <TTL en ms>
}
```

### Tokens
- [ ] Access Token : Cookie `access_token` (1h)
- [ ] Refresh Token : Cookie `refresh_token` (30d)
- [ ] Credentials : ✅ Inclus dans les requêtes
- [ ] JWT_SECRET : ✅ Configuré

### Flux de refresh
- [ ] Frontend envoie POST `/api/refresh`
- [ ] Backend valide et retourne nouveau token
- [ ] Cookie mis à jour automatiquement
- [ ] Session persiste après reload

### Vérifications
- [ ] CORS ne refuse pas les requêtes staging
- [ ] Cookies transmis avec credentials
- [ ] SameSite compatible avec HTTPS
- [ ] Secure flag activé en staging

---

## 6. Tests E2E Local

### Configuration locale
```env
TEST_BASE_URL=http://127.0.0.1:3000
TEST_API_URL=http://127.0.0.1:5000/api
E2E_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/madsuite_e2e
TEST_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
```

### Commande
```bash
npm run test:critical:full
```

### Résultats attendus
- [ ] Chromium desktop : PASS
- [ ] Chromium mobile : PASS
- [ ] WebKit mobile : PASS
- [ ] Code de sortie : 0
- [ ] Isolation multi-tenant : PASS

### Flux validé
- [ ] Signup (nouvel utilisateur + organisation)
- [ ] Login (authentification)
- [ ] Création client
- [ ] Création projet
- [ ] Enregistrement temps
- [ ] Génération facture
- [ ] Logout
- [ ] Isolation multi-tenant (Tenant B ne voit pas Tenant A)

---

## 7. Ordre de Déploiement

### Phase 1 : Préparation
- [ ] Tous les prérequis validés
- [ ] Variables d'environnement générées
- [ ] Secrets configurés
- [ ] URLs attribuées

### Phase 2 : Backend Railway
- [ ] Créer/configurer le service Railway
- [ ] Configurer les variables d'environnement
- [ ] Déployer le commit backend
- [ ] Vérifier les logs de démarrage
- [ ] Tester le healthcheck
- [ ] Vérifier les migrations
- [ ] Vérifier la connexion DB

### Phase 3 : Frontend Vercel
- [ ] Créer/configurer le projet Vercel
- [ ] Configurer les variables Vite
- [ ] Déployer le commit frontend
- [ ] Vérifier le build
- [ ] Tester l'accès à l'URL
- [ ] Vérifier les requêtes vers backend

### Phase 4 : Tests E2E Staging
- [ ] Configurer TEST_BASE_URL et TEST_API_URL
- [ ] Lancer `npm run test:critical:full`
- [ ] Valider tous les résultats
- [ ] Documenter les résultats

---

## 8. Healthchecks

### Backend
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

### Frontend
```bash
curl -X GET https://<VERCEL_STAGING_URL>/
```

**Réponse attendue** : HTML de la page d'accueil (200 OK)

### Vérifications
- [ ] Backend répond en < 1s
- [ ] Database connectée
- [ ] Frontend charge sans erreur
- [ ] Pas de redirection vers login
- [ ] Pas de erreur 5xx

---

## 9. Vérifications Post-Déploiement

### Backend
- [ ] Service Railway actif
- [ ] Logs de démarrage sans erreur
- [ ] Connexion DB établie
- [ ] Migrations appliquées
- [ ] Healthcheck répond (HTTP 200)
- [ ] Pas de boucle de redémarrage
- [ ] Pas de secret dans les logs
- [ ] Pas de erreur 5xx

### Frontend
- [ ] Build Vercel réussi
- [ ] URL staging accessible
- [ ] Pas d'erreur console
- [ ] Requêtes réseau vers backend staging
- [ ] Page signup chargée
- [ ] Routes protégées redirigent vers login
- [ ] Pas de erreur 4xx/5xx

### Flux utilisateur
- [ ] Signup fonctionne
- [ ] Login fonctionne
- [ ] Refresh token fonctionne
- [ ] Création organisation fonctionne
- [ ] Création client fonctionne
- [ ] Création projet fonctionne
- [ ] Enregistrement temps fonctionne
- [ ] Génération facture fonctionne
- [ ] Logout fonctionne
- [ ] Isolation multi-tenant validée

---

## 10. Rollback

### Frontend Vercel
- [ ] Procédure : Redéployer le commit précédent
- [ ] Ou utiliser "Rollback" dans Vercel
- [ ] Restaurer les variables d'environnement précédentes
- [ ] Temps estimé : 2-5 minutes

### Backend Railway
- [ ] Procédure : Redéployer le commit précédent
- [ ] Restaurer les variables d'environnement précédentes
- [ ] Vérifier les migrations (non réversibles)
- [ ] Temps estimé : 5-10 minutes

### Base de données
- [ ] Stratégie : Backup avant migration
- [ ] Restauration : Depuis le backup (procédure manuelle)
- [ ] Migrations réversibles : À identifier
- [ ] Temps estimé : 10-30 minutes

### Procédure complète
1. [ ] Arrêter le service backend
2. [ ] Restaurer la base de données depuis le backup
3. [ ] Redéployer le commit backend précédent
4. [ ] Redéployer le commit frontend précédent
5. [ ] Vérifier les healthchecks
6. [ ] Valider le flux utilisateur

---

## 11. Critères d'acceptation

### READY TO CONFIGURE STAGING
- ✅ Tous les dépôts synchronisés
- ✅ Aucun changement local
- ✅ Configuration de déploiement validée
- ✅ Healthcheck identifié
- ✅ Migrations versionnées
- ✅ CORS et cookies configurés
- ✅ Tests E2E locaux PASS
- ✅ Prérequis documentés

### STAGING VALIDATED (après déploiement)
- ✅ Backend Railway répond
- ✅ Frontend Vercel charge
- ✅ Signup fonctionne en staging
- ✅ Refresh token fonctionne
- ✅ Matrice E2E staging retourne zéro
- ✅ Isolation multi-tenant validée
- ✅ Rollback documenté
- ✅ Logs sans erreur

### BLOCKED
- ❌ Prérequis manquants
- ❌ Configuration incomplète
- ❌ Tests E2E locaux échouent
- ❌ Healthcheck non trouvé
- ❌ Migrations destructives non documentées

---

## 12. Commits

| Composant | Commit | Message |
|-----------|--------|---------|
| E2E | 7372ab1 | test(e2e): automate critical authenticated staging flow with multi-tenant isolation |
| Backend | fac1233 | Merge branch 'main' of https://github.com/maddevopss/madsuite |
| Frontend | fac1233 | Merge branch 'main' of https://github.com/maddevopss/madsuite |
| Global | fac1233 | Merge branch 'main' of https://github.com/maddevopss/madsuite |

---

## 13. Informations requises pour déployer

### Avant de continuer
- [ ] Accès Railway fourni
- [ ] Accès Vercel fourni
- [ ] DATABASE_URL staging fourni
- [ ] Secrets JWT fournis
- [ ] Clés Stripe test fournies
- [ ] URLs attribuées par Vercel et Railway

### À documenter
- [ ] URL frontend staging réelle
- [ ] URL backend staging réelle
- [ ] Commit déployé (backend)
- [ ] Commit déployé (frontend)
- [ ] Statut du build
- [ ] Résultats E2E staging

---

## 14. Verdict

**Statut actuel** : ✅ READY TO CONFIGURE STAGING

**Prochaines étapes** :
1. Fournir les accès et secrets
2. Configurer les variables d'environnement
3. Déployer le backend sur Railway
4. Déployer le frontend sur Vercel
5. Exécuter les tests E2E contre staging
6. Valider le flux utilisateur complet
7. Déclarer STAGING VALIDATED

---

**Dernière mise à jour** : 15 juillet 2026, 15:32 UTC-4  
**Responsable** : Cline (AI Assistant)
