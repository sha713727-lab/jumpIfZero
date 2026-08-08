#!/usr/bin/env bash
set -euo pipefail

SECRETS_FILE="${JZ_SECRETS_FILE:-/root/jz-secrets.env}"
APP_ROOT="${JZ_APP_ROOT:-/var/www/jumpifzero}"
REPO_URL="${JZ_REPO_URL:-https://github.com/sha713727-lab/jumpIfZero.git}"
DOMAIN="${JZ_DOMAIN:-jumpifzero.com}"
OPS_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# shellcheck disable=SC1090
source "$SECRETS_FILE"

echo "=== deploy app to ${APP_ROOT} ==="

if [[ ! -d "$APP_ROOT/.git" ]]; then
  mkdir -p "$(dirname "$APP_ROOT")"
  git clone "$REPO_URL" "$APP_ROOT"
else
  git -C "$APP_ROOT" fetch --depth 1 origin main
  git -C "$APP_ROOT" checkout main
  git -C "$APP_ROOT" pull --ff-only origin main
fi

chown -R jumpifzero:jumpifzero "$APP_ROOT"

install -d -m 750 /etc/jumpifzero
install -m 640 /dev/null /etc/jumpifzero/backend.env
install -m 640 /dev/null /etc/jumpifzero/frontend.env

cat > /etc/jumpifzero/backend.env <<EOF
NODE_ENV=production
HOST=127.0.0.1
PORT=3011
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=jumpifzero
DATABASE_USER=jz_app
DATABASE_PASSWORD=${JZ_APP_PASSWORD}
HMAC_SECRET=${JZ_HMAC_SECRET}
HMAC_SECRET_PREVIOUS=
HMAC_KEY_ID=v1
HMAC_KEY_ID_PREVIOUS=
HMAC_GATEWAY_SUBJECT_ID=${JZ_HMAC_GATEWAY_SUBJECT_ID}
TAX_ID_AEAD_KEY=${JZ_TAX_ID_AEAD_KEY}
TAX_ID_AEAD_KEY_PREVIOUS=
FILE_STORAGE_ROOT=/var/lib/jumpifzero/files
FILE_STORAGE_BACKEND=local
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_FORCE_PATH_STYLE=false
RATE_LIMIT_BACKEND=postgres
NONCE_BACKEND=postgres
REDIS_URL=
OTEL_ENABLED=false
OTEL_SERVICE_NAME=jumpifzero-backend
OTEL_EXPORTER_OTLP_ENDPOINT=
SENTRY_DSN=
CORS_ORIGIN=https://${DOMAIN}
REQUEST_TIMEOUT_MS=30000
BODY_MAX_BYTES=52428800
SLOW_QUERY_MS=500
DATABASE_POOL_MAX=10
DATABASE_IDLE_TIMEOUT_MS=30000
DATABASE_CONNECTION_TIMEOUT_MS=5000
SHUTDOWN_DRAIN_MS=15000
METRICS_ENABLED=false
EMAIL_PROVIDER=demo
EMAIL_FROM=HR@${DOMAIN}
RESEND_API_KEY=
EOF

cat > /etc/jumpifzero/frontend.env <<EOF
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
SESSION_SECRET=${JZ_SESSION_SECRET}
BACKEND_BASE_URL=http://127.0.0.1:3011
HMAC_SECRET=${JZ_HMAC_SECRET}
HMAC_KEY_ID=v1
SENTRY_DSN=
DEMO_ADMIN_EMAIL=${JZ_DEMO_ADMIN_EMAIL}
DEMO_ADMIN_PASSWORD=${JZ_DEMO_ADMIN_PASSWORD}
DEMO_EMPLOYEE_PASSWORD=${JZ_DEMO_EMPLOYEE_PASSWORD}
DEMO_CUSTOMER_PASSWORD=${JZ_DEMO_CUSTOMER_PASSWORD}
EOF

chown root:jumpifzero /etc/jumpifzero/backend.env /etc/jumpifzero/frontend.env
chmod 640 /etc/jumpifzero/backend.env /etc/jumpifzero/frontend.env

cd "$APP_ROOT"
sudo -u jumpifzero npm ci
# NEXT_PUBLIC_* is inlined at build time
sudo -u jumpifzero env \
  NEXT_PUBLIC_SITE_URL="https://${DOMAIN}" \
  npm run build -w frontend

install -m 644 "$OPS_DIR/systemd/jumpifzero-backend.service" /etc/systemd/system/jumpifzero-backend.service
install -m 644 "$OPS_DIR/systemd/jumpifzero-frontend.service" /etc/systemd/system/jumpifzero-frontend.service
# Rewrite WorkingDirectory if APP_ROOT differs
sed -i "s|/var/www/jumpifzero|${APP_ROOT}|g" /etc/systemd/system/jumpifzero-backend.service
sed -i "s|/var/www/jumpifzero|${APP_ROOT}|g" /etc/systemd/system/jumpifzero-frontend.service

systemctl daemon-reload
systemctl enable jumpifzero-backend jumpifzero-frontend
systemctl restart jumpifzero-backend
sleep 2
systemctl restart jumpifzero-frontend

systemctl --no-pager --full status jumpifzero-backend jumpifzero-frontend || true
echo "=== app deploy done ==="
