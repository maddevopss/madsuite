@echo off
:: Ce fichier lance la création et l'installation du certificat de test en mode Admin
SET SCRIPT_PATH=%~dp0create-test-cert.ps1

echo [MADSuite] Verification et installation du certificat de test...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"

echo.
echo Operation terminee.
pause