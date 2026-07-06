# Modules System Rules

## Data Layer

- **ONLY** `frontend/src/api/modules.api.js` may call backend `/organisation/modules*` endpoints.

## State Layer

- **ONLY** `frontend/src/hooks/useModules*.jsx` consumes `modules.api.js`.

## UI Layer

- **ONLY** `frontend/src/components/ModulesPanel*.jsx` renders the modules list.

## Composition Layer

- Settings/Pages must **NEVER** fetch modules directly.
- They must compose the UI using `useModules()` + `ModulesPanel`.

## Hard rule

Any violation = architecture drift regression.
