# MADSuite

MADSuite est un écosystème de gestion pour travailleurs autonomes et petites équipes : clients, projets, suivi du temps, facturation, rapports et assistance contextuelle.

Ce dépôt est le **point d’orientation public et le dépôt intégrateur local** de l’écosystème. Le code d’exécution est maintenu dans des dépôts spécialisés.

## Dépôts actifs

| Dépôt | Responsabilité |
|---|---|
| [`maddevopss/madsuite-frontend`](https://github.com/maddevopss/madsuite-frontend) | Application web React/Vite |
| [`maddevopss/madsuite-backend`](https://github.com/maddevopss/madsuite-backend) | API, logique métier, sécurité multi-tenant et données |
| [`maddevopss/desktop-agent`](https://github.com/maddevopss/desktop-agent) | Agent Electron local |
| [`maddevopss/e2e`](https://github.com/maddevopss/e2e) | Validation Playwright inter-repos |

La gouvernance, les décisions d’architecture et les standards MADPROOF sont maintenus dans le dépôt privé gardien `bleeband/SYSTEME_MAD`.

## Architecture

```text
madsuite-frontend
        │
        ├── HTTP / WebSocket
        ▼
madsuite-backend ─── PostgreSQL / services externes
        ▲
        │
desktop-agent

          e2e
           │
           └── valide les parcours distribués
```

## Démarrage local reproductible

Placez les dépôts côte à côte :

```text
workspace/
├── madsuite/
├── madsuite-frontend/
├── madsuite-backend/
├── desktop-agent/
└── e2e/
```

Prérequis communs :

- Node.js et npm accessibles dans le `PATH`;
- Docker et Docker Compose disponibles;
- ports `5173`, `5050` et `54329` disponibles.

### Windows / PowerShell

```powershell
./scripts/start-local.ps1
```

Pour arrêter :

```powershell
./scripts/stop-local.ps1
```

Pour un workspace situé ailleurs :

```powershell
./scripts/start-local.ps1 -WorkspaceRoot "T:\Projets\MADSuite"
```

### Linux, macOS ou WSL

Rendez les scripts exécutables après le clone :

```bash
chmod +x scripts/*.sh
```

Démarrage :

```bash
./scripts/start-local.sh
```

Arrêt :

```bash
./scripts/stop-local.sh
```

Pour un workspace situé ailleurs :

```bash
WORKSPACE_ROOT=/chemin/vers/workspace ./scripts/start-local.sh
```

Pour éviter `npm ci` lorsque les dépendances sont déjà installées :

```bash
SKIP_INSTALL=1 ./scripts/start-local.sh
```

Les commandes de démarrage :

1. valident les outils et les dépôts requis;
2. démarrent PostgreSQL 16 avec Docker Compose;
3. installent les dépendances manquantes;
4. appliquent les migrations backend;
5. démarrent le backend sur `http://127.0.0.1:5050`;
6. démarrent le frontend sur `http://127.0.0.1:5173`;
7. attendent les endpoints de disponibilité avant d’annoncer le succès.

Les journaux et PID locaux sont écrits dans `.local-runtime/`, qui est ignoré par Git.

Le volume PostgreSQL est conservé entre les démarrages. Pour repartir complètement à zéro :

```bash
docker compose -f compose.local.yml down -v
```

## Validation multi-dépôts

PowerShell :

```powershell
./scripts/check-all.ps1
```

Shell Unix :

```bash
./scripts/check-all.sh
```

Pour tenter également la validation du Desktop Agent lorsqu’il expose `check:desktop` :

```powershell
./scripts/check-all.ps1 -IncludeDesktopAgent
```

```bash
INCLUDE_DESKTOP_AGENT=1 ./scripts/check-all.sh
```

Chaque échec indique le dépôt et la commande en cause; aucun succès global n’est affiché si une couche échoue.

## État du produit

MADSuite est en développement actif. Les dépôts applicatifs possèdent leurs propres instructions d’installation, variables d’environnement, commandes de test et pipelines CI.

## Principes

- sécurité multi-tenant par défaut;
- décisions et affirmations traçables;
- aucune promesse médicale ou diagnostique;
- collecte minimale et traitement local privilégié pour les fonctions contextuelles;
- petites PR, tests ciblés et guards contractuels.

## Contribution

Avant une PR :

1. exécuter la commande `check:*` du dépôt concerné ou `./scripts/check-all.ps1` / `./scripts/check-all.sh`;
2. documenter les impacts de déploiement et de sécurité;
3. ajouter ou mettre à jour les tests pertinents;
4. garder une seule responsabilité principale par PR.

## Licence

Chaque dépôt applicatif définit sa propre licence dans ses fichiers de projet. Aucune licence globale différente ne doit être déduite de ce méta-dépôt.

## Auteur

Marc-André Dufour — MAD DevOps
