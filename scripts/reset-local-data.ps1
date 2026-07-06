# Script de réinitialisation pour MADSuite
# Ce script ferme l'application et efface les données locales (sessions, cache, réglages).

$AppName = "MADSuite"
$AppDataFolder = Join-Path $env:APPDATA $AppName
$BackupFolder = Join-Path ([Environment]::GetFolderPath("Desktop")) "MADSuite_Debug_Logs"

Write-Host "--- Réinitialisation de $AppName ---" -ForegroundColor Cyan

# 1. Fermer l'application si elle est en cours d'exécution
Write-Host "Arrêt de l'application..."
$process = Get-Process -Name $AppName -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Name $AppName -Force
    Start-Sleep -Seconds 1
}

# 1.5 Optionnel : Sauvegarder les logs pour le support
if (Test-Path $AppDataFolder) {
    $Response = Read-Host "Souhaitez-vous sauvegarder les journaux d'erreurs sur le Bureau avant le nettoyage ? (O/N)"
    if ($Response -eq "O" -or $Response -eq "o") {
        Write-Host "Sauvegarde en cours..."
        New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
        
        # Copie des fichiers .log et du dossier logs s'ils existent
        Get-ChildItem -Path $AppDataFolder -Filter "*.log" | Copy-Item -Destination $BackupFolder -Force
        if (Test-Path (Join-Path $AppDataFolder "logs")) {
            Copy-Item -Path (Join-Path $AppDataFolder "logs") -Destination $BackupFolder -Recurse -Force
        }
        Write-Host "Terminé ! Les fichiers sont dans le dossier '$BackupFolder' sur votre Bureau." -ForegroundColor Magenta
    }
}

# 2. Supprimer le dossier de données locales
if (Test-Path $AppDataFolder) {
    Write-Host "Nettoyage des fichiers temporaires et des réglages..."
    Remove-Item -Path $AppDataFolder -Recurse -Force
    Write-Host "Succès : L'application est comme neuve !" -ForegroundColor Green
} else {
    Write-Host "Aucune donnée locale trouvée. L'application est déjà propre." -ForegroundColor Yellow
}

Write-Host "`nVous pouvez maintenant relancer MADSuite."
Pause