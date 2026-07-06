#!/bin/bash
echo "--- PRE-FLIGHT CHECK BETA ---"

# 1. Backup de sécurité immédiat
bash ./scripts/backup-db.sh

# 2. Exécution des migrations (025_partition_activity_logs notamment)
cd backend && npm run db:migrate

# 3. Test de santé de l'API
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/organisation/health)
if [ $STATUS -eq 401 ] || [ $STATUS -eq 200 ]; then
  echo "✅ API en ligne (Status: $STATUS)"
else
  echo "❌ Erreur critique: API injoignable (Status: $STATUS)"
  exit 1
fi