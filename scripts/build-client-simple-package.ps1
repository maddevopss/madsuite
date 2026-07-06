param(
    [string]$ProjectName = "madsuite",
    [string]$ReleaseName = "client-simple",
    [string]$OutputFolder = "dist"
)

$ErrorActionPreference = "Stop"

$Root = (Get-Location).Path
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$ReleaseRoot = Join-Path $Root $OutputFolder
$StagingRoot = Join-Path $ReleaseRoot "$ProjectName-$ReleaseName-$Timestamp"
$ZipPath = Join-Path $ReleaseRoot "$ProjectName-$ReleaseName-$Timestamp.zip"
$InstallerPath = Join-Path $Root "desktop-agent/dist/MADSuite Desktop Agent Setup 1.3.0.exe"
$GuidePath = Join-Path $Root "docs/guide-client-simple.txt"

function Ensure-CleanDir {
    param([string]$Path)

    if (Test-Path $Path) {
        Remove-Item $Path -Recurse -Force
    }

    New-Item -ItemType Directory -Path $Path | Out-Null
}

if (-not (Test-Path $InstallerPath)) {
    throw "Installateur introuvable: $InstallerPath"
}

if (-not (Test-Path $GuidePath)) {
    throw "Guide introuvable: $GuidePath"
}

Ensure-CleanDir -Path $ReleaseRoot
New-Item -ItemType Directory -Path $StagingRoot | Out-Null

Copy-Item -Path $InstallerPath -Destination (Join-Path $StagingRoot (Split-Path $InstallerPath -Leaf)) -Force
Copy-Item -Path $GuidePath -Destination (Join-Path $StagingRoot "Guide_client.txt") -Force

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Compress-Archive -Path (Join-Path $StagingRoot "*") -DestinationPath $ZipPath -Force

Write-Host ""
Write-Host "Pack client simple créé:" -ForegroundColor Green
Write-Host $ZipPath -ForegroundColor Green
Write-Host "Contenu:" -ForegroundColor Green
Write-Host " - Installer Windows"
Write-Host " - Guide_client.txt"
