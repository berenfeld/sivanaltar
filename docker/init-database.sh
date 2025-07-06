#!/bin/bash

# Database initialization script for sivanaltar
# This script will initialize the database with tables and initial data

set -e

echo "Starting sivanaltar database initialization..."

# Check if containers are running
if ! docker ps | grep -q "sivanaltar-mysql"; then
    echo "Error: sivanaltar-mysql container is not running!"
    echo "Please start the containers first with: docker-compose up -d"
    exit 1
fi

if ! docker ps | grep -q "sivanaltar-website"; then
    echo "Error: sivanaltar-website container is not running!"
    echo "Please start the containers first with: docker-compose up -d"
    exit 1
fi

echo "Containers are running. Proceeding with database initialization..."

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until docker exec sivanaltar-mysql mysqladmin ping -h"localhost" --silent; do
    echo "MySQL is not ready yet..."
    sleep 2
done

echo "MySQL is ready!"

# Create database and set up initial structure
echo "Setting up database structure..."
docker exec sivanaltar-mysql mysql -u root -psivanaltar_root_password -e "
CREATE DATABASE IF NOT EXISTS sivanaltar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON sivanaltar_db.* TO 'sivanaltar_user'@'%';
FLUSH PRIVILEGES;
"

echo "Database structure created successfully!"

