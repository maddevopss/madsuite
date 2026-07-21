#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(cd -- "$REPO_ROOT/.." && pwd)}"
INCLUDE_DESKTOP_AGENT="${INCLUDE_DESKTOP_AGENT:-0}"

run_check() {
  local name="$1"
  local relative_path="$2"
  local script_name="$3"
  local optional="${4:-0}"
  local repo_path="$WORKSPACE_ROOT/$relative_path"

  [[ -d "$repo_path" ]] || {
    if [[ "$optional" == "1" ]]; then
      echo "[SKIP] $name absent : $repo_path"
      return 0
    fi
    echo "Dépôt $name introuvable : $repo_path" >&2
    exit 1
  }

  [[ -f "$repo_path/package.json" ]] || {
    echo "package.json introuvable pour $name : $repo_path/package.json" >&2
    exit 1
  }

  if ! node -e "const p=require(process.argv[1]); process.exit(p.scripts && p.scripts[process.argv[2]] ? 0 : 1)" "$repo_path/package.json" "$script_name"; then
    if [[ "$optional" == "1" ]]; then
      echo "[SKIP] Le script npm '$script_name' n'existe pas encore dans $name."
      return 0
    fi
    echo "Le script npm '$script_name' est absent de $name." >&2
    exit 1
  fi

  echo
  echo "=== $name : npm run $script_name ==="
  npm --prefix "$repo_path" run "$script_name"
}

command -v node >/dev/null 2>&1 || { echo "Node.js est requis." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm est requis." >&2; exit 1; }

run_check Backend madsuite-backend check:backend
run_check Frontend madsuite-frontend check:frontend
run_check E2E e2e check:e2e

if [[ "$INCLUDE_DESKTOP_AGENT" == "1" ]]; then
  run_check "Desktop Agent" desktop-agent check:desktop 1
fi

echo
echo "Toutes les validations demandées sont vertes."
