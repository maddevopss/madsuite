# Playwright E2E Setup — Responsive Tests

## Vue d'ensemble

Configuration complète pour exécuter les tests responsive Playwright avec authentification automatique.

## Architecture

```
npm run test:e2e:responsive
  ↓
globalSetup (seed DB)
  ↓
webServer (backend + frontend)
  ├─ Backend: npm run start:test (port 5000)
  └─ Frontend: npm run dev (port 3000)
  ↓
auth-setup project
  ├─ POST /api/login
  ├─ GET /dashboard
  └─ Save auth.json
  ↓
chromium project (dépend de auth-setup)
  ├─ responsive-mobile.spec.js
  └─ responsive-screenshots.spec.js
```

## Configuration

### playwright.config.js

```javascript
const TEST_API_URL = process.env.TEST_API_URL || "http://127.0.0.1:5000";
const TEST_BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

webServer: [
  {
    command: "npm run start:test --prefix backend",
    url: TEST_API_URL + "/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  {
    command: "npm run dev --prefix frontend",
    url: TEST_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
]

projects: [
  {
    name: "auth-setup",
    testMatch: "**/auth.setup.js",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
    dependencies: ["auth-setup"],
  },
]
```

**Points clés** :
- `reuseExistingServer: !process.env.CI` : Réutilise le serveur en local, redémarre en CI
- `dependencies: ["auth-setup"]` : Chromium dépend du setup auth
- URLs avec `127.0.0.1` : Évite les problèmes IPv6 sur Windows

### e2e/auth.setup.js

```javascript
const TEST_API_URL = process.env.TEST_API_URL || "http://127.0.0.1:5000";

test("authenticate and save storage state", async ({ page, context, request }) => {
  // POST /api/login (montée par app.js)
  const loginResponse = await request.post(TEST_API_URL + "/api/login", {
    data: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    },
  });

  // Naviguer vers le dashboard
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  // Sauvegarder auth.json
  const authPath = path.resolve(process.cwd(), "auth.json");
  await context.storageState({ path: authPath });
});
```

**Points clés** :
- Route : `/api/login` (pas `/api/auth/login`)
- Authentification via API (pas besoin du frontend)
- Sauvegarde l'état de stockage (cookies, localStorage)

### backend/server.js

```javascript
// Close database connection
try {
  if (pool && typeof pool.end === "function") {
    await pool.end();
    console.log("✅ Connexion base de données fermée");
  }
} catch (err) {
  console.error("Erreur lors de la fermeture de la BD:", err);
}
```

**Points clés** :
- Vérification que `pool.end` existe avant appel
- Évite l'erreur `pool.end is not a function`

## Commandes

### Local

```bash
# Exécute les tests responsive
npm run test:e2e:responsive

# Avec variables d'environnement personnalisées
TEST_API_URL=http://127.0.0.1:5000 npm run test:e2e:responsive
```

### CI (GitHub Actions)

```bash
# Même commande, webServer redémarre à chaque run
npm run test:e2e:responsive
```

## Dépannage

### EADDRINUSE: Port 5000 déjà utilisé

**Windows** :
```powershell
# Trouver le processus utilisant le port 5000
netstat -ano | findstr :5000

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F

# Ou tuer tous les node.exe
taskkill /F /IM node.exe
```

**Linux/macOS** :
```bash
# Trouver le processus
lsof -i :5000

# Tuer le processus
kill -9 <PID>
```

### ECONNREFUSED ::1:5000

**Cause** : `localhost` résout en IPv6 (::1) sur Windows, backend écoute sur IPv4 (127.0.0.1)

**Solution** : Utiliser `127.0.0.1` au lieu de `localhost` (déjà fait dans la config)

### pool.end is not a function

**Cause** : `pool` n'a pas de méthode `end`

**Solution** : Vérifier que `pool && typeof pool.end === "function"` avant appel (déjà fait)

### auth.json manquant

**Cause** : auth-setup n'a pas généré le fichier

**Solution** :
1. Vérifier que le backend démarre : `curl http://127.0.0.1:5000/health`
2. Vérifier que la route `/api/login` existe
3. Vérifier les logs du test : `npm run test:e2e:responsive -- --debug`

### Tests responsive échouent après auth-setup

**Cause** : auth.json n'est pas utilisé correctement

**Solution** :
1. Vérifier que `storageState` est configuré dans `playwright.config.js`
2. Vérifier que `auth.json` existe dans le répertoire racine
3. Vérifier que les tests utilisent `baseURL` correctement

## Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `playwright.config.js` | Ajout webServer + URLs 127.0.0.1 + setup project |
| `e2e/auth.setup.js` | Nouveau fichier pour générer auth.json |
| `backend/server.js` | Fix pool.end check |
| `backend/src/routes/aiAssistant.routes.js` | Fix rate limiter IPv6 |

## Critères d'acceptation

✅ `npm run test:e2e:responsive` démarre automatiquement le backend  
✅ auth.setup.js génère auth.json  
✅ Les 33 tests responsive se lancent après auth-setup  
✅ Compatible Windows et CI Linux  
✅ Aucune modification de la logique métier  

## Notes

- WebServer démarre automatiquement avant les tests
- Health check `/api/health` valide le backend
- URLs avec `127.0.0.1` évitent les problèmes IPv6
- Route `/api/login` correcte (montée par app.js)
- Compatible CI (GitHub Actions) et local
- `reuseExistingServer` optimise les tests locaux
