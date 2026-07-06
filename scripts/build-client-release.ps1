param(
    [string]$ProjectName = "madsuite",
    [string]$ReleaseName = "client-delivery",
    [string]$OutputFolder = "dist"
)

$ErrorActionPreference = "Stop"

$Root = (Get-Location).Path
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$ReleaseRoot = Join-Path $Root $OutputFolder
$StagingRoot = Join-Path $ReleaseRoot "$ProjectName-$ReleaseName-$Timestamp"
$ZipPath = Join-Path $ReleaseRoot "$ProjectName-$ReleaseName-$Timestamp.zip"

function Ensure-CleanDir {
    param([string]$Path)

    if (Test-Path $Path) {
        Remove-Item $Path -Recurse -Force
    }

    New-Item -ItemType Directory -Path $Path | Out-Null
}

function Copy-ItemSafe {
    param(
        [string]$Source,
        [string]$Destination
    )

    if (-not (Test-Path $Source)) {
        Write-Host "Ignoré: $Source" -ForegroundColor Yellow
        return
    }

    if ((Get-Item $Source).PSIsContainer) {
        Copy-Item -Path $Source -Destination $Destination -Recurse -Force
    }
    else {
        $parent = Split-Path $Destination -Parent
        if (-not (Test-Path $parent)) {
            New-Item -ItemType Directory -Path $parent | Out-Null
        }
        Copy-Item -Path $Source -Destination $Destination -Force
    }
}

Write-Host "Build frontend..." -ForegroundColor Cyan
npm.cmd run frontend:build

Write-Host "Build desktop agent..." -ForegroundColor Cyan
npm.cmd run desktop-agent:build

Ensure-CleanDir -Path $ReleaseRoot
New-Item -ItemType Directory -Path $StagingRoot | Out-Null

$ItemsToCopy = @(
    ".env.example",
    "README.md",
    "docs/livrable-client.md",
    "backend",
    "frontend/build",
    "desktop-agent/dist"
)

foreach ($Item in $ItemsToCopy) {
    $SourcePath = Join-Path $Root $Item
    $DestinationPath = Join-Path $StagingRoot $Item
    Copy-ItemSafe -Source $SourcePath -Destination $DestinationPath
}

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Compress-Archive -Path (Join-Path $StagingRoot "*") -DestinationPath $ZipPath -Force

Write-Host ""
Write-Host "Release client créé:" -ForegroundColor Green
Write-Host $ZipPath -ForegroundColor Green
Write-Host "Dossier staging:" -ForegroundColor Green
Write-Host $StagingRoot -ForegroundColor Green
