#!/bin/bash

###############################################################################
# E2E Smoke Test Orchestration Script
# 
# Démarre backend + frontend + lance les tests E2E Playwright
# Gère les processus en arrière-plan et les nettoie à la fin
#
# Usage:
#   bash scripts/e2e-smoke.sh
#   bash scripts/e2e-smoke.sh --headless
#   bash scripts/e2e-smoke.sh --debug
###############################################################################

set -e

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=5000
FRONTEND_PORT=3000
BACKEND_TIMEOUT=30
FRONTEND_TIMEOUT=30
E2E_TIMEOUT=300

# Flags
HEADLESS=false
DEBUG=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --headless)
      HEADLESS=true
      shift
      ;;
    --debug)
      DEBUG=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}🧹 Nettoyage des processus...${NC}"
  
  # Tuer les processus backend et frontend
  if [ ! -z "$BACKEND_PID" ]; then
    echo "Arrêt du backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true
  fi
  
  if [ ! -z "$FRONTEND_PID" ]; then
    echo "Arrêt du frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  
  echo -e "${GREEN}✅ Nettoyage terminé${NC}"
}

# Trap EXIT pour nettoyer même en cas d'erreur
trap cleanup EXIT

# Fonction pour attendre qu'un port soit accessible
wait_for_port() {
  local port=$1
  local timeout=$2
  local service=$3
  local elapsed=0
  
  echo -e "${BLUE}⏳ Attente du service $service sur le port $port (timeout: ${timeout}s)...${NC}"
  
  while [ $elapsed -lt $timeout ]; do
    if nc -z localhost $port 2>/dev/null; then
      echo -e "${GREEN}✅ $service est prêt sur le port $port${NC}"
      return 0
    fi
    
    sleep 1
    elapsed=$((elapsed + 1))
    
    if [ $((elapsed % 5)) -eq 0 ]; then
      echo "  ... $elapsed/$timeout secondes"
    fi
  done
  
  echo -e "${RED}❌ Timeout: $service n'a pas répondu sur le port $port après ${timeout}s${NC}"
  return 1
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
  echo -e "${BLUE}🔍 Vérification des prérequis...${NC}"
  
  # Vérifier PostgreSQL
  if ! nc -z localhost 5432 2>/dev/null; then
    echo -e "${RED}❌ PostgreSQL n'est pas accessible sur localhost:5432${NC}"
    echo "   Démarrez PostgreSQL avant de lancer ce script"
    exit 1
  fi
  echo -e "${GREEN}✅ PostgreSQL est accessible${NC}"
  
  # Vérifier Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Node.js est installé ($(node --version))${NC}"
  
  # Vérifier npm
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ npm est installé ($(npm --version))${NC}"
  
  # Vérifier nc (netcat)
  if ! command -v nc &> /dev/null; then
    echo -e "${YELLOW}⚠️  netcat (nc) n'est pas disponible, les vérifications de port seront ignorées${NC}"
  fi
}

# Fonction pour démarrer le backend
start_backend() {
  echo -e "\n${BLUE}🚀 Démarrage du backend...${NC}"
  
  cd backend
  
  # Vérifier que les dépendances sont installées
  if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances backend..."
    npm install
  fi
  
  # Démarrer le backend en arrière-plan
  npm run dev > /tmp/backend.log 2>&1 &
  BACKEND_PID=$!
  
  echo "Backend démarré (PID: $BACKEND_PID)"
  echo "Logs: tail -f /tmp/backend.log"
  
  cd ..
  
  # Attendre que le backend soit prêt
  if command -v nc &> /dev/null; then
    wait_for_port $BACKEND_PORT $BACKEND_TIMEOUT "Backend"
  else
    echo "Attente de 10 secondes pour le démarrage du backend..."
    sleep 10
  fi
}

# Fonction pour démarrer le frontend
start_frontend() {
  echo -e "\n${BLUE}🚀 Démarrage du frontend...${NC}"
  
  cd frontend
  
  # Vérifier que les dépendances sont installées
  if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances frontend..."
    npm install
  fi
  
  # Démarrer le frontend en arrière-plan
  npm run dev > /tmp/frontend.log 2>&1 &
  FRONTEND_PID=$!
  
  echo "Frontend démarré (PID: $FRONTEND_PID)"
  echo "Logs: tail -f /tmp/frontend.log"
  
  cd ..
  
  # Attendre que le frontend soit prêt
  if command -v nc &> /dev/null; then
    wait_for_port $FRONTEND_PORT $FRONTEND_TIMEOUT "Frontend"
  else
    echo "Attente de 10 secondes pour le démarrage du frontend..."
    sleep 10
  fi
}

# Fonction pour lancer les tests E2E
run_e2e_tests() {
  echo -e "\n${BLUE}🧪 Lancement des tests E2E...${NC}"
  
  cd e2e
  
  # Vérifier que les dépendances sont installées
  if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances E2E..."
    npm install
  fi
  
  # Générer l'auth.json
  echo -e "\n${BLUE}🔐 Génération de la session d'authentification...${NC}"
  npm run test:auth
  
  # Lancer les tests
  echo -e "\n${BLUE}🧪 Exécution des tests E2E...${NC}"
  
  if [ "$DEBUG" = true ]; then
    npm test -- --debug
  elif [ "$HEADLESS" = true ]; then
    npm test -- --headed=false
  else
    npm test
  fi
  
  TEST_RESULT=$?
  
  # Afficher le rapport
  if [ -d "playwright-report" ]; then
    echo -e "\n${GREEN}📊 Rapport Playwright généré${NC}"
    echo "Ouvrir le rapport: npm run report"
  fi
  
  cd ..
  
  return $TEST_RESULT
}

# Main
main() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  E2E Smoke Test MADSuite — Orchestration                  ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  
  # Vérifier les prérequis
  check_prerequisites
  
  # Démarrer les services
  start_backend
  start_frontend
  
  # Lancer les tests
  run_e2e_tests
  TEST_RESULT=$?
  
  # Afficher le résumé
  echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}║  ✅ TESTS RÉUSSIS                                          ║${NC}"
  else
    echo -e "${RED}║  ❌ TESTS ÉCHOUÉS                                          ║${NC}"
  fi
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  
  exit $TEST_RESULT
}

# Lancer main
main
