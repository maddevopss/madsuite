param(
    [string]$ProjectName = "madsuite",
    [string]$ReleaseName = "client-delivery",
    [string]$OutputFolder = "dist"
)

$scriptPath = Join-Path $PSScriptRoot "scripts\zip-clean.ps1"

& $scriptPath -ProjectName $ProjectName -ReleaseName $ReleaseName -OutputFolder $OutputFolder
