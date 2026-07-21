[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$RuntimeRoot = Join-Path $RepoRoot ".local-runtime"

foreach ($name in @("frontend", "backend")) {
  $pidPath = Join-Path $RuntimeRoot "$name.pid"
  if (-not (Test-Path $pidPath)) {
    continue
  }

  $processId = (Get-Content $pidPath | Select-Object -First 1).Trim()
  if ($processId -match '^\d+$') {
    $process = Get-Process -Id ([int]$processId) -ErrorAction SilentlyContinue
    if ($process) {
      Stop-Process -Id $process.Id -Force
      Write-Host "[OK] Processus $name arrêté (PID $processId)."
    }
  }

  Remove-Item $pidPath -Force -ErrorAction SilentlyContinue
}

docker compose -f (Join-Path $RepoRoot "compose.local.yml") stop postgres
if ($LASTEXITCODE -ne 0) {
  throw "Échec de l’arrêt du conteneur PostgreSQL."
}

Write-Host "MADSuite local est arrêté. Les données PostgreSQL sont conservées dans le volume Docker."
