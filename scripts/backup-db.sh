#!/bin/bash

# Charger les variables d'environnement (adapter le chemin)
source ../backend/.env

BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H%M%S)
FILENAME="madsuite_db_$DATE.sql.gz"
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

echo "Starting database backup for $DB_NAME..."

# Export avec compression à la volée
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/$FILENAME

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/$FILENAME"
else
    echo "Backup failed!"
    exit 1
fi

# Nettoyage des vieux backups
echo "Cleaning backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "Backup process completed."