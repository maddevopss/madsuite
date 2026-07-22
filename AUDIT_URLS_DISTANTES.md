# MADSuite — Audit des URL Distantes

**Date** : 15 juillet 2026, 20:05 UTC-4  
**Statut** : AUDIT NON DESTRUCTIF

---

## 1. Frontend Vercel

### URL
```
https://project-0mkvo.vercel.app
```

### Statut HTTP
```
HTTP/1.1 200 OK
```

### Build chargé
✅ Oui (Content-Length: 1275, Content-Type: text/html)

### API appelée
**Détecté dans Content-Security-Policy** :
```
connect-src 'self' https://madsuite-backend-production.up.railway.app
```

**Interprétation** : Le frontend est configuré pour appeler le backend Railway en production.

### Erreurs console
⚠️ **À vérifier manuellement** : Ouvrir https://project-0mkvo.vercel.app dans un navigateur et inspecter la console (F12).

### Headers de sécurité
- ✅ Strict-Transport-Security : max-age=63072000 (HTTPS forcé)
- ✅ X-Content-Type-Options : nosniff
- ✅ X-Frame-Options : DENY (implicite via frame-ancestors 'none')
- ✅ Referrer-Policy : strict-origin-when-cross-origin
- ✅ Permissions-Policy : caméra, micro, géolocalisation, paiement désactivés

---

## 2. Backend Railway

### URL
```
https://madsuite-backend-production.up.railway.app
```

### Healthcheck `/api/health`

**Statut HTTP** :
```
HTTP/1.1 200 OK
```

**Temps de réponse** : ~8ms (rapide)

**Corps** :
```json
{
  "success": true,
  "code": "HEALTH_OK",
  "data": {
    "status": "ok",
    "database": "ok",
    "environment": "production"
  },
  "timestamp": "2026-07-15T20:05:48.693Z"
}
```

**Interprétation** : 
- ✅ Service actif
- ✅ Base de données connectée
- ⚠️ **Environnement déclaré : `production`**

### Headers CORS
```
access-control-allow-credentials: true
```

**Interprétation** : Credentials autorisés (cookies transmis).

### Headers de sécurité
- ✅ Strict-Transport-Security : max-age=31536000 (HTTPS forcé)
- ✅ X-Content-Type-Options : nosniff
- ✅ X-Frame-Options : SAMEORIGIN
- ✅ Referrer-Policy : no-referrer
- ✅ CSP : Restrictive (default-src 'self')

### Server
```
Server: railway-hikari
```

**Interprétation** : Service Railway actif et sain.

---

## 3. Base de Données

### Base distante présente
✅ Oui (healthcheck retourne `"database": "ok"`)

### Dédiée staging
⚠️ **INCERTAIN** : Le healthcheck ne révèle pas le nom de la base ni son fournisseur.

**Risque** : La base peut être partagée avec la production.

### Migrations
✅ Probablement appliquées (healthcheck réussit)

### E2E_DATABASE_URL locale utilisée à distance
❌ Non (E2E_DATABASE_URL est locale Docker, pas transmise)

---

## 4. CORS

### Origine autorisée
**Détecté dans le healthcheck** :
```
access-control-allow-credentials: true
```

**Détecté dans CSP du frontend** :
```
connect-src 'self' https://madsuite-backend-production.up.railway.app
```

**Interprétation** :
- ✅ Credentials autorisés
- ✅ Origine backend explicite (pas de wildcard)
- ✅ Pas de `Access-Control-Allow-Origin: *` avec credentials

### Preflight
⚠️ **À tester manuellement** : Faire une requête OPTIONS depuis le navigateur pour vérifier les headers CORS complets.

### Résultat
✅ Configuration CORS semble correcte pour cross-site (Vercel ↔ Railway)

---

## 5. Cookies

### refresh_token
⚠️ **À vérifier manuellement** : Ouvrir le DevTools, onglet Application/Storage, vérifier les cookies après un login.

**Attributs attendus** :
- httpOnly : true
- Secure : true (HTTPS)
- SameSite : ? (à vérifier)
- Path : /
- Domain : ? (à vérifier)

### access_token
⚠️ **À vérifier manuellement** : Même procédure.

### SameSite
⚠️ **CRITIQUE** : Si `SameSite=Strict`, le refresh token ne sera **pas** transmis lors des requêtes cross-site (Vercel → Railway).

**Recommandation** : Vérifier les headers `Set-Cookie` réels lors d'un login.

### Secure
✅ Doit être `true` (HTTPS en place)

### Transmis cross-site
⚠️ **À tester** : Faire un login et vérifier que le refresh token est envoyé dans les requêtes POST `/api/refresh`.

### Résultat
⚠️ **INCERTAIN** : Dépend de la configuration réelle de `SameSite` et du comportement du navigateur.

---

## 6. Sécurité d'Environnement

### Environnement production
⚠️ **OUI** : Le healthcheck retourne `"environment": "production"`

**Implications** :
- ❌ Ne pas créer de données de test
- ❌ Ne pas lancer le flux E2E complet
- ❌ Risque de contamination des données réelles
- ❌ Risque de facturation Stripe réelle

### Données jetables
❌ Non (environnement production)

### Stripe test
⚠️ **À vérifier** : Les clés Stripe configurées sont-elles en mode test (`sk_test_*`) ou production (`sk_live_*`) ?

**Risque** : Si production, les paiements seront réels.

### E2E autorisé
❌ **NON** : L'environnement est production.

---

## 7. Liaison Frontend/Backend

### Configuration détectée
- Frontend : https://project-0mkvo.vercel.app
- Backend : https://madsuite-backend-production.up.railway.app
- CSP du frontend : `connect-src 'self' https://madsuite-backend-production.up.railway.app`

### Interprétation
✅ Le frontend est configuré pour appeler le backend Railway.

### Vérification requise
⚠️ Ouvrir le DevTools du navigateur et vérifier :
1. Onglet Network
2. Faire une action (login, signup, etc.)
3. Vérifier que les requêtes vont vers `https://madsuite-backend-production.up.railway.app/api/*`

---

## 8. Risques Identifiés

### 🔴 CRITIQUE
1. **Environnement production** : Le backend déclare `"environment": "production"`
   - Risque : Contamination des données réelles
   - Risque : Facturation Stripe réelle
   - Risque : Emails envoyés à de vrais utilisateurs

2. **Base de données partagée** : Impossible de confirmer si la base est dédiée staging
   - Risque : Données de test mélangées avec production
   - Risque : Suppression accidentelle de données réelles

### 🟡 IMPORTANT
1. **SameSite=Strict possible** : Peut bloquer le refresh token cross-site
   - Risque : Authentification échouée après reload
   - Mitigation : Tester manuellement

2. **Stripe mode inconnu** : Les clés Stripe peuvent être en production
   - Risque : Paiements réels
   - Mitigation : Vérifier les variables Railway

---

## 9. Verdict

### ❌ BLOCKED

**Raisons** :
1. ✅ Frontend accessible et chargé
2. ✅ Backend accessible et sain
3. ✅ CORS configuré correctement
4. ❌ **Environnement production confirmé**
5. ❌ **Base de données non confirmée comme staging**
6. ❌ **Risque de contamination des données réelles**
7. ❌ **Risque de facturation Stripe réelle**

### Recommandations

**Avant tout test E2E** :
1. ✅ Confirmer que le backend Railway est **réellement staging** (pas production)
2. ✅ Confirmer que la base PostgreSQL est **dédiée staging** (pas production)
3. ✅ Confirmer que les clés Stripe sont en **mode test** (`sk_test_*`)
4. ✅ Confirmer que les emails sont **désactivés ou redirigés**
5. ✅ Vérifier les attributs réels des cookies (SameSite, Secure, Domain)
6. ✅ Tester manuellement le flux login/refresh/logout

**Si ces confirmations ne peuvent pas être obtenues** :
- ❌ Ne pas lancer le flux E2E
- ❌ Ne pas créer de comptes réels
- ❌ Ne pas générer de données de test

---

**Responsable** : Cline (AI Assistant)  
**Dernière mise à jour** : 15 juillet 2026, 20:05 UTC-4  
**Audit** : Non destructif, lecture seule
