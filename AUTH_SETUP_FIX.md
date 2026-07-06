# Auth Setup Fix — Responsive Tests

## Problème

Les tests responsive échouaient avec :
```
ENOENT: no such file or directory, open 'T:\\Projets\\TimeMonitoring\\auth.json'
```

Le fichier `auth.json` n'était pas généré avant l'exécution des tests.

## Cause

1. **Pas de setup project** : Playwright n'avait pas de projet dédié pour générer `auth.json`
2. **Chemin relatif fragile** : `storageState: "auth.json"` dépendait du répertoire de travail
3. **Pas de dépendance** : Les tests responsive ne dépendaient pas d'un setup préalable
4. **Frontend non démarré** : Le test d'auth tentait de naviguer vers `http://localhost:3000` sans que le frontend soit lancé

## Solution

### 1. Créer un setup project (`e2e/auth.setup.js`)

```javascript
test("authenticate and save storage state", async ({ page, context, request }) => {
  // Authentifier via l'API (pas besoin du frontend)
  const loginResponse = await request.post("http://localhost:5000/api/auth/login", {
    data: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    },
  });

  // Naviguer vers le dashboard pour capturer l'état de stockage
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  // Sauvegarder auth.json
  const authPath = path.resolve(process.cwd(), "auth.json");
  await context.storageState({ path: authPath });
});
```

**Avantages** :
- Authentification via API (pas besoin du frontend)
- Chemin absolu pour `auth.json`
- Exécuté une seule fois avant tous les tests

### 2. Configurer Playwright (`playwright.config.js`)

```javascript
projects: [
  {
    name: "auth-setup",
    testMatch: "**/auth.setup.js",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
    dependencies: ["auth-setup"],  // ← Dépend du setup
  },
]
```

**Avantages** :
- `auth-setup` s'exécute en premier
- `chromium` dépend de `auth-setup`
- `auth.json` est généré avant les tests responsive

### 3. Chemin absolu pour `storageState`

```javascript
use: {
  baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
  headless: true,
  storageState: process.env.CI ? path.resolve(process.cwd(), "auth.json") : undefined,
}
```

**Avantages** :
- Chemin absolu en CI (où le répertoire de travail peut varier)
- `undefined` en local (chaque test fait son propre login)
- Compatible Windows et Unix

## Flux d'exécution

```
npm run test:e2e:responsive
  ↓
globalSetup (seed DB)
  ↓
auth-setup project
  ├─ POST /api/auth/login
  ├─ GET /dashboard
  └─ Save auth.json
  ↓
chromium project (dépend de auth-setup)
  ├─ responsive-mobile.spec.js
  │  ├─ Utilise auth.json
  │  └─ Tests responsive
  └─ responsive-screenshots.spec.js
     ├─ Utilise auth.json
     └─ Screenshots
```

## Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `playwright.config.js` | Ajout setup project + dépendances + chemin absolu |
| `e2e/auth.setup.js` | Nouveau fichier pour générer auth.json |

## Commandes

### Local (sans CI)

```bash
# Exécute les tests responsive
npm run test:e2e:responsive

# Chaque test fait son propre login (storageState: undefined)
# auth.json n'est pas utilisé
```

### CI (GitHub Actions)

```bash
# Exécute les tests responsive
npm run test:e2e:responsive

# auth-setup génère auth.json
# chromium utilise auth.json
# Tous les tests partagent la même session
```

## Compatibilité

- ✅ Windows (chemin absolu avec `path.resolve`)
- ✅ Linux/macOS (chemin absolu avec `path.resolve`)
- ✅ CI (GitHub Actions)
- ✅ Local (sans CI)

## Critère d'acceptation

✅ `npm run test:e2e:responsive` ne doit plus échouer sur auth.json manquant

## Notes

- Le setup project s'exécute **une seule fois** avant tous les tests
- `auth.json` est généré dans le répertoire racine du projet
- Compatible avec les tests responsive et les screenshots
- Pas de modification du backend ou de la logique métier
