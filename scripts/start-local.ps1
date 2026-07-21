[CmdletBinding()]
param(
  [string]$WorkspaceRoot,
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Commande requise absente du PATH : $Name"
  }
}

function Wait-Http([string]$Url, [string]$Label, [int]$Attempts = 60) {
  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        Write-Host "[OK] $Label prêt : $Url"
        return
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  throw "$Label n'est pas devenu prêt : $Url"
}

$RepoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($WorkspaceRoot)) {
  $WorkspaceRoot = Split-Path -Parent $RepoRoot
}

$BackendRoot = Join-Path $WorkspaceRoot "madsuite-backend"
$FrontendRoot = Join-Path $WorkspaceRoot "madsuite-frontend"
$RuntimeRoot = Join-Path $RepoRoot ".local-runtime"
$LogRoot = Join-Path $RuntimeRoot "logs"

Require-Command "node"
Require-Command "npm"
Require-Command "docker"

foreach ($path in @($BackendRoot, $FrontendRoot)) {
  if (-not (Test-Path $path -PathType Container)) {
    throw "Dépôt requis introuvable : $path"
  }
}

New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

Write-Host "[1/6] Démarrage de PostgreSQL local"
docker compose -f (Join-Path $RepoRoot "compose.local.yml") up -d postgres
if ($LASTEXITCODE -ne 0) {
  throw "Échec du démarrage PostgreSQL avec Docker Compose."
}

Write-Host "[2/6] Vérification des dépendances Node"
if (-not $SkipInstall) {
  if (-not (Test-Path (Join-Path $BackendRoot "node_modules"))) {
    npm --prefix $BackendRoot ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci backend a échoué." }
  }

  if (-not (Test-Path (Join-Path $FrontendRoot "node_modules"))) {
    npm --prefix $FrontendRoot ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci frontend a échoué." }
  }
}

$env:NODE_ENV = "development"
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "54329"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "madsuite_local"
$env:DB_NAME = "madsuite_local"
$env:DATABASE_URL = "postgresql://postgres:madsuite_local@127.0.0.1:54329/madsuite_local"
$env:JWT_SECRET = "MADSuite-Local-Development-2026-Key!"
$env:REDIS_DISABLED = "true"
$env:SCHEDULERS_ENABLED = "false"
$env:STRIPE_SECRET_KEY = "test-only-placeholder"
$env:STRIPE_WEBHOOK_SECRET = "test-only-placeholder"
$env:FRONTEND_URL = "http://127.0.0.1:5173"
$env:PORT = "5050"

Write-Host "[3/6] Application des migrations"
npm --prefix $BackendRoot run db:migrate
if ($LASTEXITCODE -ne 0) {
  throw "Les migrations backend ont échoué."
}

Write-Host "[4/6] Démarrage du backend"
$backendProcess = Start-Process -FilePath "npm" -ArgumentList @("--prefix", $BackendRoot, "run", "dev") -PassThru -NoNewWindow -RedirectStandardOutput (Join-Path $LogRoot "backend.log") -RedirectStandardError (Join-Path $LogRoot "backend-error.log")
Set-Content -Path (Join-Path $RuntimeRoot "backend.pid") -Value $backendProcess.Id

try {
  Wait-Http -Url "http://127.0.0.1:5050/api/health" -Label "Backend"

  Write-Host "[5/6] Démarrage du frontend"
  $frontendProcess = Start-Process -FilePath "npm" -ArgumentList @("--prefix", $FrontendRoot, "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173") -PassThru -NoNewWindow -RedirectStandardOutput (Join-Path $LogRoot "frontend.log") -RedirectStandardError (Join-Path $LogRoot "frontend-error.log")
  Set-Content -Path (Join-Path $RuntimeRoot "frontend.pid") -Value $frontendProcess.Id

  Wait-Http -Url "http://127.0.0.1:5173" -Label "Frontend"
} catch {
  & (Join-Path $PSScriptRoot "stop-local.ps1")
  throw
}

Write-Host "[6/6] MADSuite local est prêt"
Write-Host "Frontend : http://127.0.0.1:5173"
Write-Host "Backend  : http://127.0.0.1:5050/api/health"
Write-Host "Logs     : $LogRoot"
Write-Host "Arrêt     : ./scripts/stop-local.ps1"
