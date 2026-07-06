@echo off
:: Ce fichier lance le script de nettoyage en contournant la politique d'exécution PowerShell
SET SCRIPT_PATH=%~dp0reset-local-data.ps1

echo Lancement du nettoyage de MADSuite...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"

exit