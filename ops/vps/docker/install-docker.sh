#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "run as root"
  exit 1
fi

DOMAIN="${JZ_DOMAIN:-jumpifzero.com}"
APP_ROOT="${JZ_APP_ROOT:-/var/www/jumpifzero}"
SECRETS_FILE="${JZ_SECRETS_FILE:-/root/jz-secrets.env}"
REPO_URL="${JZ_REPO_URL:-https://github.com/sha713727-lab/jumpIfZero.git}"

echo "=== stop host nginx (Docker already owns 80/443) ==="
systemctl disable --now nginx 2>/dev/null || true

echo "=== locate aviosupportdesk proxy network ==="
PROXY_NETWORK="$(docker inspect aviosupportdesk-nginx-1 --format '{{range $k,$v := .NetworkSettings.Networks}}{{println $k}}{{end}}' | head -n 1)"
if [[ -z "$PROXY_NETWORK" ]]; then
  echo "aviosupportdesk-nginx-1 not found"
  docker ps --format 'table {{.Names}}\t{{.Ports}}'
  exit 1
fi
export JZ_PROXY_NETWORK="$PROXY_NETWORK"
echo "proxy network: $JZ_PROXY_NETWORK"

echo "=== clone / update app ==="
if [[ ! -d "$APP_ROOT/.git" ]]; then
  git clone "$REPO_URL" "$APP_ROOT"
else
  git -C "$APP_ROOT" fetch --depth 1 origin main
  git -C "$APP_ROOT" checkout main
  git -C "$APP_ROOT" pull --ff-only origin main
fi
COMPOSE_DIR="$APP_ROOT/ops/vps/docker"

echo "=== secrets ==="
if [[ ! -f "$SECRETS_FILE" ]]; then
  umask 077
  cat > "$SECRETS_FILE" <<EOF
JZ_POSTGRES_SUPER_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
JZ_OWNER_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
JZ_APP_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
JZ_READONLY_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
JZ_HMAC_SECRET=$(openssl rand -base64 48 | tr -d '\n' | head -c 48)
JZ_SESSION_SECRET=$(openssl rand -base64 48 | tr -d '\n' | head -c 48)
JZ_TAX_ID_AEAD_KEY=$(openssl rand -base64 32 | tr -d '\n')
JZ_HMAC_GATEWAY_SUBJECT_ID=$(cat /proc/sys/kernel/random/uuid)
JZ_DEMO_ADMIN_EMAIL=admin@${DOMAIN}
JZ_DEMO_ADMIN_PASSWORD=$(openssl rand -base64 18 | tr -d '\n')
JZ_DEMO_EMPLOYEE_PASSWORD=$(openssl rand -base64 18 | tr -d '\n')
JZ_DEMO_CUSTOMER_PASSWORD=$(openssl rand -base64 18 | tr -d '\n')
EOF
  chmod 600 "$SECRETS_FILE"
elif ! grep -q '^JZ_POSTGRES_SUPER_PASSWORD=' "$SECRETS_FILE"; then
  echo "JZ_POSTGRES_SUPER_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')" >>"$SECRETS_FILE"
fi
# shellcheck disable=SC1090
source "$SECRETS_FILE"

install -d -m 750 /etc/jumpifzero
cat > /etc/jumpifzero/backend.env <<EOF
NODE_ENV=production
HOST=0.0.0.0
PORT=3011
DATABASE_HOST=postgres
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
BACKEND_BASE_URL=http://backend:3011
HMAC_SECRET=${JZ_HMAC_SECRET}
HMAC_KEY_ID=v1
SENTRY_DSN=
DEMO_ADMIN_EMAIL=${JZ_DEMO_ADMIN_EMAIL}
DEMO_ADMIN_PASSWORD=${JZ_DEMO_ADMIN_PASSWORD}
DEMO_EMPLOYEE_PASSWORD=${JZ_DEMO_EMPLOYEE_PASSWORD}
DEMO_CUSTOMER_PASSWORD=${JZ_DEMO_CUSTOMER_PASSWORD}
EOF
chmod 640 /etc/jumpifzero/*.env

cd "$COMPOSE_DIR"
export JZ_POSTGRES_SUPER_PASSWORD

echo "=== docker compose up postgres ==="
docker compose --env-file "$SECRETS_FILE" up -d --build postgres

for _ in $(seq 1 60); do
  docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

echo "=== database + roles + migrations (no seeds) ==="
docker compose exec -T postgres psql -U postgres -Atc "SELECT 1 FROM pg_database WHERE datname='jumpifzero'" | grep -q 1 \
  || docker compose exec -T postgres psql -U postgres -c "CREATE DATABASE jumpifzero"

docker compose exec -T postgres psql -U postgres -d jumpifzero -v ON_ERROR_STOP=1 < "$APP_ROOT/database/roles/001_roles.sql"
docker compose exec -T postgres psql -U postgres -d jumpifzero -c "ALTER ROLE jz_owner PASSWORD '${JZ_OWNER_PASSWORD}'"
docker compose exec -T postgres psql -U postgres -d jumpifzero -c "ALTER ROLE jz_app PASSWORD '${JZ_APP_PASSWORD}'"
docker compose exec -T postgres psql -U postgres -d jumpifzero -c "ALTER ROLE jz_readonly PASSWORD '${JZ_READONLY_PASSWORD}'"
docker compose exec -T postgres psql -U postgres -c "ALTER DATABASE jumpifzero OWNER TO jz_owner"

shopt -s nullglob
for f in "$APP_ROOT"/database/migrations/*.up.sql; do
  version="$(basename "$f" .up.sql)"
  checksum="$(sha256sum "$f" | awk '{print $1}')"
  has_table="$(docker compose exec -T postgres psql -U postgres -d jumpifzero -Atc \
    "SELECT 1 FROM information_schema.tables WHERE table_name='schema_migrations'" 2>/dev/null || true)"
  if [[ "$has_table" == "1" ]]; then
    done="$(docker compose exec -T postgres psql -U postgres -d jumpifzero -Atc \
      "SELECT 1 FROM schema_migrations WHERE version='${version}'" || true)"
    if [[ "$done" == "1" ]]; then
      echo "skip $version"
      continue
    fi
  fi
  echo "apply $version"
  docker compose exec -T postgres psql -U postgres -d jumpifzero -v ON_ERROR_STOP=1 < "$f"
  docker compose exec -T postgres psql -U postgres -d jumpifzero -v ON_ERROR_STOP=1 -c \
    "INSERT INTO schema_migrations (version, checksum) VALUES ('${version}', '${checksum}') ON CONFLICT (version) DO NOTHING"
done

echo "=== build/start backend + frontend ==="
docker compose --env-file "$SECRETS_FILE" up -d --build backend frontend

echo "=== install nginx vhost into aviosupportdesk ==="
NGINX_ID="$(docker ps -qf name=aviosupportdesk-nginx)"
HOST_CONF_DIR="$(docker inspect "$NGINX_ID" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d"}}{{println .Source}}{{end}}{{end}}' | head -n 1)"
if [[ -z "$HOST_CONF_DIR" ]]; then
  NGINX_ROOT="$(docker inspect "$NGINX_ID" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx"}}{{println .Source}}{{end}}{{end}}' | head -n 1)"
  if [[ -n "$NGINX_ROOT" ]]; then
    mkdir -p "$NGINX_ROOT/conf.d"
    HOST_CONF_DIR="$NGINX_ROOT/conf.d"
  fi
fi

if [[ -n "$HOST_CONF_DIR" && -d "$HOST_CONF_DIR" ]]; then
  cp "$COMPOSE_DIR/nginx-jumpifzero.conf" "$HOST_CONF_DIR/jumpifzero.conf"
  docker exec "$NGINX_ID" nginx -t
  docker exec "$NGINX_ID" nginx -s reload
  echo "nginx vhost: $HOST_CONF_DIR/jumpifzero.conf"
else
  echo "WARNING: nginx conf mount not found. Inspect mounts and add server_name jumpifzero.com manually:"
  docker inspect "$NGINX_ID" --format '{{json .Mounts}}'
  echo "proxy_pass http://jumpifzero-frontend:3010; network=$JZ_PROXY_NETWORK"
fi

echo
echo "=== DONE ==="
echo "Secrets: $SECRETS_FILE"
echo "Local check: curl -sI -H 'Host: jumpifzero.com' http://127.0.0.1 | head"
docker compose --env-file "$SECRETS_FILE" ps
