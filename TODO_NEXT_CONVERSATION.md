# TODO prochaine conversation - MADSuite local

## Etat actuel

- `TimeMonitoring` = MADSuite.
- Frontend: `npm.cmd run check:frontend` vert.
  - Guards frontend verts.
  - Lint vert.
  - Tests Jest: 60/60 suites, 307/307 tests.
  - Build Vite vert.
- Backend: `npm.cmd run check:backend` vert.
  - Guards backend verts.
  - `test:modules` vert.
  - Jest complet vert.
  - `test:security` vert.
  - Lint vert.
- Desktop-agent: `npm.cmd run check:desktop` vert.
  - Guards verts.
  - Syntax check vert.
  - Jest: 5/5 suites, 53 tests passes, 1 skipped.
- E2E: `npm.cmd run check:e2e` vert.
  - Guards verts.
  - Playwright public responsive: 30/30 tests passes.
  - Le runner démarre/arrête Vite local automatiquement.

## Corrections deja faites

- Restaure les manifests/locks backend/frontend coherents.
- Restaure le vrai `backend/server.js` MADSuite.
- Restaure `backend/src/routes/login.js` complet.
- Corrige les guards trop fragiles/faux positifs.
- Corrige les imports modules frontend via le barrel public.
- Transforme les pages legacy top-level en re-export vers les vraies pages dossier:
  - `src/pages/Clients.jsx`
  - `src/pages/Dashboard.jsx`
  - `src/pages/Reports.jsx`
  - `src/pages/Timesheet.jsx`
  - `src/pages/Users.jsx`
- Nettoie les artefacts suivis:
  - `.pfx`
  - screenshots backend
  - `cookies.txt`
  - `test-results/.last-run.json`
  - `tmp_*.json`
- Renforce `.gitignore`.
- Backend: rend Jest déterministe avec fermeture DB + `--forceExit`.
- Desktop-agent: corrige hygiene guard Git-visible, contract guard CRLF, setup Jest `NODE_ENV=test`, test queue Windows-safe.
- E2E: corrige hygiene guard Git-visible, runner public local, stub API public précis, timeout `networkidle`.

## A faire ensuite

1. Revoir le diff complet avant commit.
2. Verifier les statuts Git dans les nested repos:
   - `TimeMonitoring`
   - `TimeMonitoring/desktop-agent`
   - `TimeMonitoring/e2e`
3. Decider si on commit les suppressions d'artefacts dans chaque repo.
4. Pousser et verifier les CI GitHub.
5. Confirmer branch protection sur les repos d'execution.
6. Rendre E2E authentifié obligatoire quand staging/secrets sont stables.

## Commandes utiles

```bash
cd T:\Projets\maddevops\TimeMonitoring\frontend
npm.cmd run check:frontend

cd T:\Projets\maddevops\TimeMonitoring\backend
npm.cmd run check:backend

cd T:\Projets\maddevops\TimeMonitoring\desktop-agent
npm.cmd run check:desktop

cd T:\Projets\maddevops\TimeMonitoring\e2e
npm.cmd run check:e2e
```

## Risques restants

- Vite signale des chunks lourds, surtout `Reports`; non bloquant.
- Desktop Jest signale `MaxListenersExceededWarning` SIGTERM; non bloquant mais a surveiller.
- E2E public est vert local; E2E authentifié reste optionnel.
- Branch protection et CI distante non confirmees depuis local.
