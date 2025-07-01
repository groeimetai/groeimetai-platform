#!/bin/sh
# Automated backup script for PostgreSQL database

# Set backup directory
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# Database connection parameters from environment
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-groeimetai}"
DB_USER="${DB_USER:-groeimetai}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform backup
echo "[$(date)] Starting database backup..."
PGPASSWORD="${PGPASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"
    
    # Clean up old backups (keep last 7 days)
    find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +7 -delete
    echo "[$(date)] Cleaned up old backups"
else
    echo "[$(date)] Backup failed!" >&2
    exit 1
fi

# Add cron job for automated backups (runs daily at 2 AM)
echo "0 2 * * * /backup.sh >> /var/log/backup.log 2>&1" | crontab -