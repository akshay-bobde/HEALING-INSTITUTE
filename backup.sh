#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="./backups/healingdb_$TIMESTAMP.sql"
MYSQL_ROOT_PASSWORD=yourpassword

docker exec mysql_container_name sh -c "exec mysqldump -uroot -p$MYSQL_ROOT_PASSWORD healingdb" > $BACKUP_FILE

aws s3 cp $BACKUP_FILE s3://your-s3-bucket/healingdb_backups/
