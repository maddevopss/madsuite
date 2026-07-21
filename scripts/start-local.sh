#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(cd -- "$REPO_ROOT/.." && pwd)}"
SKIP_INSTALL="${SKIP_INSTALL:-0}"

BACKEND_ROOT="$WORKSPACE_ROOT/madsuite-backend"
FRONTEND_ROOT="$WORKSPACE_ROOT/madsuite-frontend"
RUNTIME_ROOT="$REPO_ROOT/.local-runtime"
LOG_ROOT="$RUNTIME_ROOT/logs"

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Commande requise absente du PATH : $1" >&2
    exit 1
  }
}

wait_http() {
  local url="$1"
  local label="$2"
  local attempts="${3:-60}"

  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if curl --fail --silent --show-error --max-time 3 "$url" >/dev/null 2>&1; then
      echo "[OK] $label prêt : $url"
      return 0
    fi
    sleep 1
  done

  echo "$label n'est pas devenu prêt : $url" >&2
  return 1
}

require_command node
require_command npm
require_command docker
require_command curl

for path in "$BACKEND_ROOT" "$FRONTEND_ROOT"; do
  [[ -d "$path" ]] || {
    echo "Dépôt requis introuvable : $path" >&2
    exit 1
  }
done

mkdir -p "$LOG_ROOT"

echo "[1/6] Démarrage de PostgreSQL local"
docker compose -f "$REPO_ROOT/compose.local.yml" up -d postgres

echo "[2/6] Vérification des dépendances Node"
if [[ "$SKIP_INSTALL" != "1" ]]; then
  [[ -d "$BACKEND_ROOT/node_modules" ]] || npm --prefix "$BACKEND_ROOT" ci
  [[ -d "$FRONTEND_ROOT/node_modules" ]] || npm --prefix "$FRONTEND_ROOT" ci
fi

export NODE_ENV=development
export DB_HOST=127.0.0.1
export DB_PORT=54329
export DB_USER=postgres
export DB_PASSWORD=madsuite_local
export DB_NAME=madsuite_local
export DATABASE_URL=postgresql://postgres:madsuite_local@127.0.0.1:54329/madsuite_local
export JWT_SECRET=MADSuite-Local-Development-2026-Key
export REDIS_DISABLED=true
export SCHEDULERS_ENABLED=false
export STRIPE_SECRET_KEY=test-only-placeholder
export STRIPE_WEBHOOK_SECRET=test-only-placeholder
export FRONTEND_URL=http://127.0.0.1:5173
export PORT=5050

echo "[3/6] Application des migrations"
npm --prefix "$BACKEND_ROOT" run db:migrate

echo "[4/6] Démarrage du backend"
nohup npm --prefix "$BACKEND_ROOT" run dev >"$LOG_ROOT/backend.log" 2>"$LOG_ROOT/backend-error.log" &
echo $! >"$RUNTIME_ROOT/backend.pid"

cleanup_on_error() {
  "$SCRIPT_DIR/stop-local.sh" || true
}
trap cleanup_on_error ERR

wait_http http://127.0.0.1:5050/api/health Backend

echo "[5/6] Démarrage du frontend"
nohup npm --prefix "$FRONTEND_ROOT" run dev -- --host 127.0.0.1 --port 5173 >"$LOG_ROOT/frontend.log" 2>"$LOG_ROOT/frontend-error.log" &
echo $! >"$RUNTIME_ROOT/frontend.pid"

wait_http http://127.0.0.1:5173 Frontend
trap - ERR

echo "[6/6] MADSuite local est prêt"
echo "Frontend : http://127.0.0.1:5173"
echo "Backend  : http://127.0.0.1:5050"
echo "Arrêt     : ./scripts/stop-local.sh"
