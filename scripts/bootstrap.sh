#!/bin/bash
# Bootstrap script for sivanaltar.com on Ubuntu 24
# Idempotent — safe to re-run to fix or upgrade.
# Run as root from the repo root: bash scripts/bootstrap.sh
set -e

DOMAIN="sivanaltar.com"
EMAIL="berenfeldran@gmail.com"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Installing Node 20 ==="
if ! command -v node &>/dev/null || [[ $(node -v) != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "  Node $(node -v) already installed, skipping"
fi

echo "=== Installing PostgreSQL ==="
if ! command -v psql &>/dev/null; then
  apt-get install -y postgresql postgresql-contrib
else
  echo "  PostgreSQL already installed, skipping"
fi

echo "=== Installing Nginx ==="
if ! command -v nginx &>/dev/null; then
  apt-get install -y nginx
else
  echo "  Nginx already installed, skipping"
fi

echo "=== Installing Certbot ==="
if ! command -v certbot &>/dev/null; then
  apt-get install -y certbot python3-certbot-nginx
else
  echo "  Certbot already installed, skipping"
fi

echo "=== Installing PM2 ==="
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
else
  echo "  PM2 already installed, skipping"
fi

echo "=== Creating OS user sivanaltar ==="
if ! id sivanaltar &>/dev/null; then
  useradd -m -s /bin/bash sivanaltar
  echo "sivanaltar:sivanaltar" | chpasswd
fi

echo "=== Creating app directories ==="
mkdir -p /var/www/sivanaltar/{app,uploads,server}
chown -R ubuntu:ubuntu /var/www/sivanaltar/server
chown -R ubuntu:ubuntu /var/www/sivanaltar/app
chown -R ubuntu:ubuntu /var/www/sivanaltar/uploads

echo "=== Creating PostgreSQL user and database ==="
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='sivanaltar'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER sivanaltar WITH PASSWORD 'sivanaltar';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='sivanaltar'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE sivanaltar OWNER sivanaltar;"

echo "=== Configuring Nginx ==="
rm -f /etc/nginx/sites-enabled/default

CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
if [ -f "$CERT_PATH" ]; then
  # Certs already exist — use full config with SSL blocks
  cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/sivanaltar
else
  # First run — deploy HTTP-only config so certbot can complete its challenge
  cat > /etc/nginx/sites-available/sivanaltar << NGINX_HTTP
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root /var/www/sivanaltar/app/dist;
    location / { try_files \$uri \$uri/ /index.html; }
}
NGINX_HTTP
fi

ln -sf /etc/nginx/sites-available/sivanaltar /etc/nginx/sites-enabled/sivanaltar
nginx -t && systemctl reload nginx

echo "=== Obtaining / renewing SSL certificate via Let's Encrypt ==="
certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --redirect \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

# Now install the full config with all redirects
cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/sivanaltar
nginx -t && systemctl reload nginx

echo "=== Verifying HTTPS ==="
curl -sI "https://www.$DOMAIN/api/health" | head -3

echo "=== Setting up PM2 startup ==="
PM2_CMD=$(pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null | grep "^sudo " | head -1)
if [ -n "$PM2_CMD" ]; then eval "$PM2_CMD"; fi || true

echo ""
echo "Bootstrap complete!"
echo "  Site:  https://www.$DOMAIN"
echo "  API:   https://www.$DOMAIN/api/health"
