# Script pour générer un certificat auto-signé pour test MSIX
$CertName = "MADSuite-Test-Cert"
$PFXPassword = "password123" # À changer si besoin
$OutputDir = Join-Path $PSScriptRoot "certs"

if (!(Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir }

$PfxPath = Join-Path $OutputDir "test-certificate.pfx"

# --- NOUVEAU : On évite de redemander l'admin si le fichier est déjà là ---
if (Test-Path $PfxPath) {
    Write-Host "Certificat de test déjà présent. Génération ignorée." -ForegroundColor Yellow
    exit 0
}

# --- NOUVEAU : Vérification des privilèges Administrateur ---
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERREUR : Ce script doit être exécuté en tant qu'ADMINISTRATEUR pour installer le certificat." -ForegroundColor Red
    Write-Host "Veuillez relancer PowerShell en tant qu'administrateur."
    exit 1
}

Write-Host "Génération du certificat auto-signé..." -ForegroundColor Cyan

# Création du certificat dans le magasin personnel
$cert = New-SelfSignedCertificate -Type CodeSigningCert `
    -Subject "CN=MAD" `
    -FriendlyName "MADSuite Development Certificate" `
    -HashAlgorithm sha256 `
    -KeyLength 2048 `
    -CertStoreLocation "Cert:\CurrentUser\My"

# Exportation en format PFX
$pwd = ConvertTo-SecureString -String $PFXPassword -Force -AsPlainText
$cert | Export-PfxCertificate -FilePath $PfxPath -Password $pwd

# --- NOUVEAU : Installation automatique dans les racines de confiance ---
Write-Host "Installation du certificat dans les Autorités de confiance..." -ForegroundColor Cyan
Import-PfxCertificate -FilePath $PfxPath -CertStoreLocation Cert:\LocalMachine\Root -Password $pwd | Out-Null

Write-Host "Succès ! Certificat généré ici : $PfxPath" -ForegroundColor Green
Write-Host "Mot de passe PFX : $PFXPassword"
Write-Host "Empreinte (Thumbprint) : $($cert.Thumbprint)"
Write-Host "Statut : Installé et approuvé sur cette machine." -ForegroundColor Green

Write-Host "`nVous pouvez maintenant compiler votre package MSIX, il sera reconnu par Windows."
Pause