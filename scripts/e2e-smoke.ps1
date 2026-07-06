# E2E Smoke Test Orchestration Script (PowerShell)
# 
# Démarre backend + frontend + lance les tests E2E Playwright
# Gère les processus en arrière-plan et les nettoie à la fin
#
# Usage:
#   .\scripts\e2e-smoke.ps1
#   .\scripts\e2e-smoke.ps1 -Headless
#   .\scripts\e2e-smoke.ps1 -Debug

param(
  [switch]$DebugMode,
  [switch]$Headless
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"
$E2EDir = Join-Path $RootDir "e2e"

$BackendPort = 5000
$FrontendPort = 3000
$PostgresContainer = "madsuite-postgres-test"

$BackendProcess = $null
$FrontendProcess = $null

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "=== $Message ===" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Message)
  Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Message)
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail {
  param([string]$Message)
  Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Test-Port {
  param([int]$Port)

  $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
  return $null -ne $connection
}

function Wait-Url {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 60
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  return $false
}

function Check-Postgres {
  Write-Step "Checking PostgreSQL"

  $psql = Get-Command psql -ErrorAction SilentlyContinue

  if ($psql) {
    try {
      psql -U postgres -d madsuite_test -c "SELECT 1;"
      Write-Ok "PostgreSQL available through local psql"
      return
    } catch {
      Write-Warn "Local psql found, but connection failed. Trying Docker fallback."
    }
  } else {
    Write-Warn "psql not found in PATH. Trying Docker fallback."
  }

  $docker = Get-Command docker -ErrorAction SilentlyContinue
  if (-not $docker) {
    throw "Docker is not available and psql is not installed."
  }

  $container = docker ps --filter "name=$PostgresContainer" --format "{{.Names}}"

  if ($container -ne $PostgresContainer) {
    Write-Warn "PostgreSQL Docker container is not running."

    $existing = docker ps -a --filter "name=$PostgresContainer" --format "{{.Names}}"
    if ($existing -eq $PostgresContainer) {
      Write-Host "Starting existing container $PostgresContainer..."
      docker start $PostgresContainer | Out-Null
    } else {
      Write-Host "Creating PostgreSQL container $PostgresContainer..."
      docker run --name $PostgresContainer `
        -e POSTGRES_USER=postgres `
        -e POSTGRES_PASSWORD=1234 `
        -e POSTGRES_DB=madsuite_test `
        -p 5432:5432 `
        -d postgres:15 | Out-Null
    }

    Start-Sleep -Seconds 5
  }

  docker exec $PostgresContainer psql -U postgres -d madsuite_test -c "SELECT 1;"
  Write-Ok "PostgreSQL available through Docker"
}

function Install-Dependencies {
  Write-Step "Installing dependencies if needed"

  if (Test-Path $BackendDir) {
    Push-Location $BackendDir
    if (-not (Test-Path "node_modules")) {
      npm install
    }
    Pop-Location
    Write-Ok "Backend dependencies ready"
  } else {
    throw "Backend directory not found: $BackendDir"
  }

  if (Test-Path $FrontendDir) {
    Push-Location $FrontendDir
    if (-not (Test-Path "node_modules")) {
      npm install
    }
    Pop-Location
    Write-Ok "Frontend dependencies ready"
  } else {
    throw "Frontend directory not found: $FrontendDir"
  }

  if (Test-Path $E2EDir) {
    Push-Location $E2EDir
    if (-not (Test-Path "node_modules")) {
      npm install
    }
    npx playwright install
    Pop-Location
    Write-Ok "E2E dependencies ready"
  } else {
    throw "E2E directory not found: $E2EDir"
  }
}

function Start-Services {
  Write-Step "Starting backend and frontend"

  if (Test-Port $BackendPort) {
    Write-Warn "Port $BackendPort already in use. Assuming backend is already running."
  } else {
    Push-Location $BackendDir
    $script:BackendProcess = Start-Process powershell `
      -ArgumentList "-NoExit", "-Command", "npm run dev" `
      -PassThru
    Pop-Location
  }

  if (Test-Port $FrontendPort) {
    Write-Warn "Port $FrontendPort already in use. Assuming frontend is already running."
  } else {
    Push-Location $FrontendDir
    $script:FrontendProcess = Start-Process powershell `
      -ArgumentList "-NoExit", "-Command", "npm run dev" `
      -PassThru
    Pop-Location
  }

  $backendReady = Wait-Url "http://localhost:$BackendPort" 90
  if (-not $backendReady) {
    Write-Warn "Backend did not respond on http://localhost:$BackendPort. Continuing because API root may not expose GET /."
  } else {
    Write-Ok "Backend is reachable"
  }

  $frontendReady = Wait-Url "http://localhost:$FrontendPort" 90
  if (-not $frontendReady) {
    throw "Frontend did not respond on http://localhost:$FrontendPort"
  }

  Write-Ok "Frontend is reachable"
}

function Run-E2E {
  Write-Step "Running Playwright E2E smoke tests"

  Push-Location $E2EDir

  $playwrightArgs = @("playwright", "test")

  if ($DebugMode) {
    $playwrightArgs += "--debug"
  }

  if ($Headless) {
    $env:CI = "true"
  }

  Write-Host "Command: npx $($playwrightArgs -join ' ')"

  & npx @playwrightArgs

  if ($LASTEXITCODE -ne 0) {
    throw "Playwright tests failed with exit code $LASTEXITCODE"
  }

  Pop-Location
}

function Cleanup {
  Write-Step "Cleanup"

  if ($BackendProcess -and -not $BackendProcess.HasExited) {
    Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Ok "Backend process stopped"
  }

  if ($FrontendProcess -and -not $FrontendProcess.HasExited) {
    Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Ok "Frontend process stopped"
  }
}

try {
  Write-Step "MADSuite E2E Smoke Test"

  Write-Host "Root: $RootDir"
  Write-Host "Backend: $BackendDir"
  Write-Host "Frontend: $FrontendDir"
  Write-Host "E2E: $E2EDir"

  Check-Postgres
  Install-Dependencies
  Start-Services
  Run-E2E

   Write-Ok "E2E smoke test completed"
   
   Write-Step "Viewing Playwright Report"
   $reportPath = Join-Path $E2EDir "playwright-report"
   if (Test-Path $reportPath) {
     Write-Host "Report found at: $reportPath"
     Write-Host "To view the report, run:"
     Write-Host "  cd $E2EDir"
     Write-Host "  npx playwright show-report"
   } else {
     Write-Warn "Report directory not found at: $reportPath"
   }
} catch {
   Write-Fail $_.Exception.Message
   exit 1
} finally {
   Cleanup
}
