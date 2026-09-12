#!/usr/bin/env bash
# One-time server preparation for iq.iq-a2z.com (idempotent). Run as root.
set -euo pipefail

DOMAIN=iq.iq-a2z.com
APP_USER=iqsport
ROOT=/opt/iq-sport
PORT=3400

echo "== user + directories"
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --home-dir "$ROOT" --shell /usr/sbin/nologin "$APP_USER"
fi
mkdir -p "$ROOT"/{data,media,releases,backups,.ssh}
chown "$APP_USER:$APP_USER" "$ROOT"
chown -R "$APP_USER:$APP_USER" "$ROOT"/{data,media,releases}
chown root:root "$ROOT/backups"
chmod 750 "$ROOT"

echo "== environment file"
if [ ! -f "$ROOT/.env" ]; then
  cat > "$ROOT/.env" <<EOF
# مجموعة العراق الرياضية — production (https://$DOMAIN)
DATABASE_URL=file:$ROOT/data/iq-sport.db
DATABASE_AUTH_TOKEN=
MEDIA_DIR=$ROOT/media
PAYLOAD_SECRET=$(openssl rand -hex 32)
PREVIEW_SECRET=$(openssl rand -hex 24)
NEXT_PUBLIC_SERVER_URL=https://$DOMAIN
NODE_ENV=production
PORT=$PORT
EOF
fi
chown "$APP_USER:$APP_USER" "$ROOT/.env"
chmod 600 "$ROOT/.env"

echo "== deploy key (read-only access to the private GitHub repo)"
if [ ! -f "$ROOT/.ssh/deploy_key" ]; then
  ssh-keygen -t ed25519 -N "" -C "iq-sport deploy key ($(hostname))" -f "$ROOT/.ssh/deploy_key" -q
fi
cat > "$ROOT/.ssh/config" <<EOF
Host github.com
  IdentityFile $ROOT/.ssh/deploy_key
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
EOF
chown -R "$APP_USER:$APP_USER" "$ROOT/.ssh"
chmod 700 "$ROOT/.ssh"; chmod 600 "$ROOT/.ssh/deploy_key" "$ROOT/.ssh/config"

echo "== systemd service"
cat > /etc/systemd/system/iq-sport.service <<EOF
[Unit]
Description=IQ Sports Group — Next.js + Payload CMS (https://$DOMAIN)
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$ROOT/app
EnvironmentFile=$ROOT/.env
Environment=NODE_OPTIONS=--no-deprecation
# No -H/--hostname on purpose: with one, Next.js resolves middleware rewrites
# against a different origin than requests arriving through nginx and turns
# them into failed external proxies. The port is closed to the outside by ufw.
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p $PORT
Restart=always
RestartSec=3
TimeoutStopSec=20

# Hardening: the process may only write to its own data, uploads and cache.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictSUIDSGID=true
ReadWritePaths=$ROOT/data $ROOT/media $ROOT/releases
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable iq-sport.service >/dev/null 2>&1 || true

echo "== firewall: app port reachable from loopback only"
ufw status | grep -q "^$PORT/tcp.*DENY" || ufw deny "$PORT/tcp" comment "iq-sport: nginx upstream, loopback only" >/dev/null

echo "== nginx rate-limit zones"
cat > /etc/nginx/conf.d/iq-sport-limits.conf <<'EOF'
# iq-sport — login attempts are throttled at the edge (Payload also locks the
# account after repeated failures); the general API zone only stops floods.
limit_req_zone $binary_remote_addr zone=iqsport_login:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=iqsport_api:10m   rate=600r/m;
EOF

echo "== nginx vhost (HTTP only until the certificate exists)"
write_http_block() {
cat <<EOF
# IQ Sports Group — $DOMAIN
# Next.js listens on 127.0.0.1:$PORT only; this vhost is the single way in.

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/acme;
        default_type "text/plain";
        try_files \$uri =404;
    }

    location / { return 301 https://\$host\$request_uri; }

    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log  /var/log/nginx/$DOMAIN.error.log;
}
EOF
}
write_https_block() {
cat <<EOF

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    server_tokens off;
    # Payload's upload limit is 15 MB.
    client_max_body_size 16m;

    # The app sets its own security headers (HSTS, nosniff, frame-options,
    # referrer and permissions policies) on every response.

    proxy_http_version 1.1;
    proxy_set_header Host              \$host;
    proxy_set_header X-Real-IP         \$remote_addr;
    proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade           \$http_upgrade;
    proxy_set_header Connection        "upgrade";
    proxy_read_timeout 120s;

    # Uploaded files: immutable, no rate limit.
    location ^~ /api/media/file/ {
        proxy_pass http://127.0.0.1:$PORT;
    }

    # Admin login: strict throttle; fail2ban's nginx-limit-req jail bans repeat offenders.
    location = /api/users/login {
        limit_req zone=iqsport_login burst=5 nodelay;
        proxy_pass http://127.0.0.1:$PORT;
    }
    location = /api/users/forgot-password {
        limit_req zone=iqsport_login burst=3 nodelay;
        proxy_pass http://127.0.0.1:$PORT;
    }

    location /api/ {
        limit_req zone=iqsport_api burst=120 nodelay;
        proxy_pass http://127.0.0.1:$PORT;
    }

    # Hashed build assets.
    location /_next/static/ {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_cache_valid 200 30d;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:$PORT;
    }

    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml application/manifest+json;
    gzip_min_length 1024;

    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log  /var/log/nginx/$DOMAIN.error.log;
}
EOF
}

CONF=/etc/nginx/sites-available/$DOMAIN.conf
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  { write_http_block; write_https_block; } > "$CONF"
else
  write_http_block > "$CONF"
fi
ln -sf "$CONF" /etc/nginx/sites-enabled/$DOMAIN.conf
mkdir -p /var/www/acme
nginx -t
systemctl reload nginx

echo "== certificate"
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  certbot certonly --webroot -w /var/www/acme -d "$DOMAIN" --non-interactive --agree-tos --keep-until-expiring
  { write_http_block; write_https_block; } > "$CONF"
  nginx -t
systemctl reload nginx
fi
# Renewals must reach the running nginx.
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/bin/sh
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo "== daily backup (database snapshot + uploads), 14 days kept"
cat > "$ROOT/backup.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ROOT=/opt/iq-sport
STAMP=$(date +%Y%m%d-%H%M)
DEST=$ROOT/backups/$STAMP
mkdir -p "$DEST"
# Consistent SQLite snapshot even while the site is writing (online backup API).
python3 - "$ROOT/data/iq-sport.db" "$DEST/iq-sport.db" <<'PY'
import sqlite3, sys
src = sqlite3.connect(sys.argv[1]); dst = sqlite3.connect(sys.argv[2])
src.backup(dst); dst.close(); src.close()
PY
tar -czf "$DEST/media.tgz" -C "$ROOT" media
cp "$ROOT/.env" "$DEST/env" && chmod 600 "$DEST/env"
find "$ROOT/backups" -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +
EOF
chmod 750 "$ROOT/backup.sh"
cat > /etc/cron.d/iq-sport-backup <<'EOF'
# Nightly snapshot of the IQ Sports Group database and uploads.
30 3 * * * root /opt/iq-sport/backup.sh >> /var/log/iq-sport-backup.log 2>&1
EOF

echo "== done"
