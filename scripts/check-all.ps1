[CmdletBinding()]
param(
  [string]$WorkspaceRoot,
  [switch]$IncludeDesktopAgent
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($WorkspaceRoot)) {
  $WorkspaceRoot = Split-Path -Parent $RepoRoot
}

$checks = @(
  @{ Name = "Backend"; Path = "madsuite-backend"; Script = "check:backend" },
  @{ Name = "Frontend"; Path = "madsuite-frontend"; Script = "check:frontend" },
  @{ Name = "E2E"; Path = "e2e"; Script = "check:e2e" }
)

if ($IncludeDesktopAgent) {
  $checks += @{ Name = "Desktop Agent"; Path = "desktop-agent"; Script = "check:desktop" }
}

foreach ($check in $checks) {
  $path = Join-Path $WorkspaceRoot $check.Path
  if (-not (Test-Path $path -PathType Container)) {
    throw "Dépôt $($check.Name) introuvable : $path"
  }

  $packagePath = Join-Path $path "package.json"
  if (-not (Test-Path $packagePath)) {
    throw "package.json introuvable pour $($check.Name) : $packagePath"
  }

  $package = Get-Content $packagePath -Raw | ConvertFrom-Json
  if (-not $package.scripts.PSObject.Properties.Name.Contains($check.Script)) {
    if ($check.Name -eq "Desktop Agent") {
      Write-Warning "Le script npm '$($check.Script)' n’existe pas encore dans Desktop Agent; validation ignorée."
      continue
    }
    throw "Le script npm '$($check.Script)' est absent de $($check.Name)."
  }

  Write-Host "`n=== $($check.Name) : npm run $($check.Script) ==="
  npm --prefix $path run $check.Script
  if ($LASTEXITCODE -ne 0) {
    throw "Validation échouée pour $($check.Name)."
  }
}

Write-Host "`nToutes les validations demandées sont vertes."
