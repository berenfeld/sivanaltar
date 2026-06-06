#!/bin/bash
# Deploy sivanaltar to AWS VM
# Run from repo root: bash scripts/deploy.sh
# Requires: SSH key at ~/.ssh/sivanaltar.com-access
set -e

VM="ubuntu@51.102.220.193"
SSH_KEY="$HOME/.ssh/sivanaltar.com-access"
SSH="ssh -i $SSH_KEY"
SCP="scp -i $SSH_KEY"
RSYNC="rsync -avz -e \"ssh -i $SSH_KEY\""

echo "=== Building frontend ==="
npm install
npm run build

echo "=== Uploading frontend dist ==="
rsync -avz -e "ssh -i $SSH_KEY" dist/ $VM:/var/www/sivanaltar/app/dist/

echo "=== Uploading server ==="
rsync -avz -e "ssh -i $SSH_KEY" \
  --exclude node_modules \
  server/ $VM:/var/www/sivanaltar/server/

echo "=== Installing server dependencies on VM ==="
$SSH $VM "cd /var/www/sivanaltar/server && npm install --production"

echo "=== Running DB schema ==="
$SSH $VM "PGPASSWORD=sivanaltar psql -U sivanaltar -d sivanaltar -h localhost -f /var/www/sivanaltar/server/db/schema.sql"

echo "=== Restarting server ==="
$SSH $VM "pm2 restart sivanaltar 2>/dev/null || pm2 start /var/www/sivanaltar/server/index.js --name sivanaltar && pm2 save"

echo ""
echo "Deploy complete! Site: http://51.102.220.193"
