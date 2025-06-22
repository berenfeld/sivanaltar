#!/bin/bash

echo "=== Starting Sivan Altar Website Services ==="

# Wait for MySQL container to be ready
echo "Waiting for MySQL container to be ready..."
timeout=60
counter=0
while ! mysqladmin ping -h"mysql" -u"sivanaltar_user" -p"sivanaltar_password" --silent && [ $counter -lt $timeout ]; do
    echo "Waiting for MySQL... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 1))
done

if [ $counter -eq $timeout ]; then
    echo "MySQL container failed to be ready within $timeout seconds"
    exit 1
fi

echo "MySQL is ready!"

# Set proper permissions for uploads directory
echo "Setting up permissions..."
chown -R www-data:www-data /var/www/html/uploads
chmod -R 755 /var/www/html/uploads

# Create log directories if they don't exist
mkdir -p /var/log/php

# Set proper permissions for logs
chown -R www-data:www-data /var/log/php

echo "=== Services are ready! ==="
echo "Website: http://localhost:8000"
echo "MySQL: mysql:3306"

# Start Apache in foreground
echo "Starting Apache..."
apache2ctl -D FOREGROUND