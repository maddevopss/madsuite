# MADSuite — Préflight Staging Corrigé

**Date** : 15 juillet 2026, 15:43 UTC-4  
**Statut** : ✅ READY TO CONFIGURE STAGING

---

## 1. Git

### Fichiers versionnés
- ✅ `docs/STAGING_DEPLOYMENT_CHECKLIST.md` (commité)
- ✅ `PREFLIGHT_STAGING_FINAL.md` (commité)
- ✅ `STAGING_DEPLOYMENT_REPORT.md` (non-commité, à ignorer)

### Commit créé
```
69527e1 (HEAD -> main) docs(staging): add deployment preparation and preflight guides
```

### Arbre propre
```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
nothing to commit, working tree clean
```

**Verdict** : ✅ Arbre propre, documents versionnés

---

## 2. Access Token

### Stockage principal
**Mémoire JavaScript** (variable `accessToken` dans `tokenStore.jsx`)

**Fichier source** : `frontend/src/api/tokenStore.jsx`

```javascript
let accessToken = null;

export const setAccessToken = (token, broadcast = true) => {
  accessToken = token;
  // ...
};

export const getAccessToken = () => {
  return accessToken;
};
```

### Cookie access_token
**OUI, existe réellement** : Cookie HTTP-only créé par le backend

**Fichier source** : `backend/src/routes/login.js`

```javascript
const ACCESS_COOKIE_NAME = "access_token";

function setAccessCookie(res, token) {
  res.cookie(ACCESS_COOKIE_NAME, token, buildCookieOptions(authService.ACCESS_TOKEN_TTL_MS));
}

function clearAccessCookie(res) {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: "/" });
}
```

**Routes créant le cookie** :
- POST `/api/login` : `setAccessCookie(res, result.accessToken)`
- POST `/api/signup` : `setAccessCookie(res, result.accessToken)`
- POST `/api/refresh` : `setAccessCookie(res, result.accessToken)`

**Routes supprimant le cookie** :
- POST `/api/logout` : `clearAccessCookie(res)`

### Utilisé par
**Backend UNIQUEMENT** : Le cookie `access_token` est créé par le backend mais **N'EST PAS LU** par le backend pour authentifier les requêtes.

**Raison** : Le backend utilise le header `Authorization: Bearer <token>` (envoyé par le frontend depuis `tokenStore.jsx`).

**Fichier source** : `backend/src/routes/login.js`

```javascript
// POST /api/logout
router.post("/logout", async (req, res, next) => {
  const authHeader = req.headers.authorization;  // ← Lit le header, pas le cookie
  const refreshToken = getRefreshTokenFromRequest(req);  // ← Lit le cookie refresh_token
  
  if (!authHeader?.startsWith("Bearer ") && !refreshToken) {
    clearRefreshCookie(res);
    return res.status(401).json(ApiResponse.error("TOKEN_MISSING", { message: "Token manquant" }));
  }

  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  // ...
});
```

### Transmis par
**Frontend** : Header `Authorization: Bearer <token>` (depuis `tokenStore.jsx`)

**Fichier source** : `frontend/src/api/api.jsx`

```javascript
api.interceptors.request.use(async (config) => {
  let token = getAccessToken();  // ← Récupère depuis tokenStore (mémoire)
  
  // ...
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // ← Envoie en header
  }
  
  // ...
});
```

### Persistance au reload
**Access Token** : ❌ Perdu au reload (stocké en mémoire)

**Refresh Token** : ✅ Persiste au reload (cookie HTTP-only)

**Comportement** :
1. Utilisateur recharge la page
2. Access token en mémoire : perdu
3. Refresh token en cookie : persiste
4. Frontend appelle POST `/api/refresh` automatiquement
5. Backend valide le refresh token et retourne un nouveau access token
6. Frontend stocke le nouveau access token en mémoire

**Fichier source** : `frontend/src/api/api.jsx` (intercepteur)

```javascript
api.interceptors.request.use(async (config) => {
  let token = getAccessToken();

  // Si pas de token en mémoire, essayer de le rafraîchir
  if (!token) {
    await refreshTokenIfNeeded();  // ← Appelle POST /api/refresh
    token = getAccessToken();
  }
  
  // ...
});
```

---

## 3. Refresh Token

### Stockage
**Cookie HTTP-only** (nom : `refresh_token`)

**Fichier source** : `backend/src/routes/login.js`

```javascript
const COOKIE_NAME = "refresh_token";

function buildCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.REFRESH_COOKIE_SAMESITE || "strict",
    path: "/",
    maxAge,
  };
}

function setRefreshCookie(res, token) {
  res.cookie(COOKIE_NAME, token, buildCookieOptions(authService.REFRESH_TOKEN_TTL_MS));
}
```

### Cookie
**Noms exacts** :
1. `access_token` : Access token JWT (créé mais non utilisé pour l'authentification)
2. `refresh_token` : Refresh token JWT (utilisé pour renouveler l'access token)

**Attributs** :
```javascript
{
  httpOnly: true,        // ✅ Pas accessible via JavaScript
  secure: <production>,  // ✅ HTTPS en production
  sameSite: "strict",    // ✅ Défaut strict (configurable via REFRESH_COOKIE_SAMESITE)
  path: "/",             // ✅ Accessible partout
  maxAge: <TTL en ms>    // ✅ Expiration automatique
}
```

### Rotation
**OUI** : Le refresh token est rotaté à chaque appel à POST `/api/refresh`

**Fichier source** : `backend/src/routes/login.js`

```javascript
router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    // ...
    const result = await authService.refreshSession({
      refreshToken: parsed.data.refreshToken,
      req,
    });

    setRefreshCookie(res, result.refreshToken);  // ← Nouveau refresh token
    setAccessCookie(res, result.accessToken);    // ← Nouveau access token
    
    return res.status(200).json({
      success: true,
      code: "REFRESH_SUCCESS",
      token: result.accessToken,
      expiresIn: authService.ACCESS_TOKEN_EXPIRES_IN,
      refreshTokenExpiresIn: authService.REFRESH_TOKEN_EXPIRES_IN,
      user: result.user,
    });
  } catch (err) {
    clearAccessCookie(res);
    clearRefreshCookie(res);
    return handleServiceError(err, res, next, { success: false });
  }
});
```

### Route
**Endpoint** : `POST /api/refresh`

**Accepte** :
- Cookie `refresh_token` (HTTP-only)
- Body `refreshToken` (fallback)

**Retourne** :
```json
{
  "success": true,
  "code": "REFRESH_SUCCESS",
  "token": "<new_access_token>",
  "expiresIn": "1h",
  "refreshTokenExpiresIn": "30d",
  "user": { ... }
}
```

### Révocation
**Implicite au logout** : Les deux cookies sont supprimés

**Fichier source** : `backend/src/routes/login.js`

```javascript
router.post("/logout", async (req, res, next) => {
  // ...
  try {
    await authService.logoutSession({ token, refreshToken });

    clearAccessCookie(res);      // ← Supprime access_token
    clearRefreshCookie(res);     // ← Supprime refresh_token

    return res.status(200).json({ success: true });
  } catch (err) {
    clearAccessCookie(res);
    clearRefreshCookie(res);
    return handleServiceError(err, res, next, { success: false });
  }
});
```

---

## 4. Documentation

### Fichiers corrigés
- ✅ `PREFLIGHT_STAGING_FINAL.md` : Affirmation corrigée sur le cookie access_token
- ✅ `docs/STAGING_DEPLOYMENT_CHECKLIST.md` : Checklist mise à jour
- ✅ `STAGING_DEPLOYMENT_REPORT.md` : Rapport de préparation (non-commité)

### Contradictions supprimées
**Avant** : "Access Token stocké uniquement en mémoire"  
**Après** : ✅ "Access Token stocké en mémoire ET en cookie HTTP-only (non utilisé pour l'authentification)"

**Avant** : "Cookie access_token n'existe pas"  
**Après** : ✅ "Cookie access_token existe, créé au login/signup/refresh, supprimé au logout, mais N'EST PAS utilisé par le backend pour authentifier les requêtes"

**Avant** : "Frontend utilise uniquement le cookie refresh_token"  
**Après** : ✅ "Frontend utilise le header Authorization pour l'access token et le cookie refresh_token pour le refresh"

---

## 5. Verdict

### ✅ READY TO CONFIGURE STAGING

**Tous les critères validés** :

1. ✅ Commit E2E (7372ab1) publié sur origin/main
2. ✅ Documents versionnés (commit 69527e1)
3. ✅ Arbre Git propre (nothing to commit, working tree clean)
4. ✅ Access Token : mémoire JavaScript + cookie HTTP-only (non utilisé)
5. ✅ Refresh Token : cookie HTTP-only (utilisé)
6. ✅ Cookies : httpOnly, secure (prod), sameSite (strict)
7. ✅ Route refresh : POST `/api/refresh` avec rotation
8. ✅ Credentials : `withCredentials: true` (frontend), `credentials: true` (backend)
9. ✅ Authentification : Header Authorization (access token), Cookie (refresh token)
10. ✅ Documentation corrigée et validée

### Prochaines Étapes

1. Fournir les accès Railway et Vercel
2. Fournir DATABASE_URL staging
3. Fournir secrets JWT
4. Fournir clés Stripe test
5. Configurer les variables d'environnement
6. Déployer le backend sur Railway
7. Déployer le frontend sur Vercel
8. Exécuter les tests E2E contre staging
9. Valider le flux utilisateur complet
10. Déclarer STAGING VALIDATED

---

**Responsable** : Cline (AI Assistant)  
**Dernière mise à jour** : 15 juillet 2026, 15:43 UTC-4  
**Commit** : 69527e1 (docs(staging): add deployment preparation and preflight guides)
