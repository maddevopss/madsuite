#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
RUNTIME_ROOT="$REPO_ROOT/.local-runtime"

stop_pid_file() {
  local name="$1"
  local pid_file="$RUNTIME_ROOT/$name.pid"

  [[ -f "$pid_file" ]] || return 0

  local pid
  pid="$(tr -d '[:space:]' <"$pid_file")"
  if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null; then
    echo "Arrêt de $name (PID $pid)"
    kill "$pid" 2>/dev/null || true

    for _ in {1..10}; do
      kill -0 "$pid" 2>/dev/null || break
      sleep 1
    done

    if kill -0 "$pid" 2>/dev/null; then
      echo "Arrêt forcé de $name (PID $pid)"
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi

  rm -f "$pid_file"
}

stop_pid_file frontend
stop_pid_file backend

echo "Arrêt de PostgreSQL local"
docker compose -f "$REPO_ROOT/compose.local.yml" down

echo "Services locaux arrêtés. Le volume PostgreSQL est conservé."
