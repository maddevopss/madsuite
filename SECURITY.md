# Sécurité MADSuite Agent

## 1. Isolation des données (RLS)

L'isolation multi-organisation est gérée au niveau du moteur PostgreSQL via **Row-Level Security**.
L'agent ne doit jamais stocker l'ID d'organisation en clair dans les requêtes métier, il est injecté via le contexte de session `app.current_organisation_id`.

## 2. Gestion des Tokens

- **Stockage** : Le JWT est stocké via `electron-store` chiffré par une clé dérivée de `safeStorage` (OS-level).
- **Rotation** : Les jetons sont rafraîchis via un mutex pour éviter les race conditions.
- **Nettoyage** : Un logout force la suppression physique du fichier `session.json`.

## 3. Communication IPC

- Tous les handlers utilisent `handleSecure`.
- **Redaction** : Les tokens Bearer sont automatiquement caviardés dans les logs via regex.
- **Validation** : Entrées validées par **Zod** avant exécution.

## 4. Diagnostics & Logs

- Les logs ne contiennent aucun secret.
- Les exports de diagnostics suppriment les champs `token`, `cookie` et `authorization` avant écriture sur disque.
