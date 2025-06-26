#!/bin/bash

# Update script for Sivan Altar website container
# This script copies the latest repository code into the running container

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="sivanaltar-website"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${YELLOW}🔄 Updating Sivan Altar website in container...${NC}"

# Check if container is running
if ! docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Container '${CONTAINER_NAME}' is not running!${NC}"
    echo -e "${YELLOW}💡 Start the container first with: docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Container '${CONTAINER_NAME}' is running${NC}"

# Create a temporary directory for the update
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}📁 Created temporary directory: ${TEMP_DIR}${NC}"

# Copy repository files to temp directory (excluding docker and git files)
echo -e "${YELLOW}📋 Copying repository files...${NC}"
rsync -av --exclude='.git' \
          --exclude='docker' \
          --exclude='.dockerignore' \
          --exclude='node_modules' \
          --exclude='vendor' \
          --exclude='*.log' \
          --exclude='.env*' \
          --exclude='.*' \
          "${REPO_ROOT}/" "${TEMP_DIR}/"

# Copy the update to the container
echo -e "${YELLOW}📤 Copying files to container...${NC}"
docker cp "${TEMP_DIR}/." "${CONTAINER_NAME}:/var/www/html/"

# Set proper permissions in the container
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
docker exec "${CONTAINER_NAME}" chown -R www-data:www-data /var/www/html
docker exec "${CONTAINER_NAME}" chmod -R 755 /var/www/html

# Clean up temporary directory
rm -rf "${TEMP_DIR}"
echo -e "${GREEN}🧹 Cleaned up temporary directory${NC}"

echo -e "${GREEN}✅ Website updated successfully!${NC}"
echo -e "${YELLOW}💡 The changes should be immediately available at http://localhost:8080${NC}"

