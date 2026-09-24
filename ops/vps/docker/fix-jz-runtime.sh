#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "run as root"
  exit 1
fi

JZ_SECRETS_FILE="${JZ_SECRETS_FILE:-/root/jz-secrets.env}"
APP_ROOT="${JZ_APP_ROOT:-/var/www/jumpifzero}"
COMPOSE_DIR="$APP_ROOT/ops/vps/docker"
DOMAIN="${JZ_DOMAIN:-jumpifzero.com}"

if [[ ! -f "$JZ_SECRETS_FILE" ]]; then
  echo "missing $JZ_SECRETS_FILE"
  exit 1
fi
# shellcheck disable=SC1090
set -a
source "$JZ_SECRETS_FILE"
set +a

cd "$COMPOSE_DIR"
export JZ_PROXY_NETWORK="${JZ_PROXY_NETWORK:-aviosupportdesk_avion}"

echo "=== SAFETY before (read-only) ==="
docker ps --format '{{.Names}} {{.Status}}' | grep -E 'aviosupport|flightbugs|quantara|jumpifzero' || true

echo "=== harden JZ env (docker bind) ==="
install -d -m 750 /etc/jumpifzero
cp -a /etc/jumpifzero/backend.env "/etc/jumpifzero/backend.env.bak.$(date +%s)"
sed -i 's/^HOST=.*/HOST=0.0.0.0/' /etc/jumpifzero/backend.env
sed -i 's/^DATABASE_HOST=.*/DATABASE_HOST=postgres/' /etc/jumpifzero/backend.env
grep -E '^(HOST|PORT|DATABASE_HOST)=' /etc/jumpifzero/backend.env

if [[ -f /etc/jumpifzero/frontend.env ]]; then
  cp -a /etc/jumpifzero/frontend.env "/etc/jumpifzero/frontend.env.bak.$(date +%s)"
  if grep -q '^BACKEND_BASE_URL=' /etc/jumpifzero/frontend.env; then
    sed -i 's|^BACKEND_BASE_URL=.*|BACKEND_BASE_URL=http://backend.jumpifzero_jz_internal:3011|' /etc/jumpifzero/frontend.env
  else
    echo 'BACKEND_BASE_URL=http://backend.jumpifzero_jz_internal:3011' >> /etc/jumpifzero/frontend.env
  fi
  if [[ -n "${JZ_HMAC_GATEWAY_SUBJECT_ID:-}" ]]; then
    if grep -q '^HMAC_GATEWAY_SUBJECT_ID=' /etc/jumpifzero/frontend.env; then
      sed -i "s|^HMAC_GATEWAY_SUBJECT_ID=.*|HMAC_GATEWAY_SUBJECT_ID=${JZ_HMAC_GATEWAY_SUBJECT_ID}|" /etc/jumpifzero/frontend.env
    else
      echo "HMAC_GATEWAY_SUBJECT_ID=${JZ_HMAC_GATEWAY_SUBJECT_ID}" >> /etc/jumpifzero/frontend.env
    fi
  fi
fi

echo "=== seed service pages (JZ DB only, idempotent) ==="
PAGES_BEFORE="$(docker compose --env-file "$JZ_SECRETS_FILE" exec -T postgres \
  psql -U postgres -d jumpifzero -Atc 'SELECT count(*) FROM service_pages_active;')"
echo "service_pages_active before=$PAGES_BEFORE"
for f in \
  "$APP_ROOT/database/seeds/dev/007_service_page_hierarchy.sql" \
  "$APP_ROOT/database/seeds/dev/008_seo_copy_updates.sql" \
  "$APP_ROOT/database/seeds/dev/009_seo_insights.sql"
do
  echo "apply $(basename "$f")"
  docker compose --env-file "$JZ_SECRETS_FILE" exec -T postgres \
    psql -U postgres -d jumpifzero -v ON_ERROR_STOP=1 < "$f"
done
PAGES_AFTER="$(docker compose --env-file "$JZ_SECRETS_FILE" exec -T postgres \
  psql -U postgres -d jumpifzero -Atc 'SELECT count(*) FROM service_pages_active WHERE published_at IS NOT NULL;')"
echo "published service pages after=$PAGES_AFTER"
if [[ "$PAGES_AFTER" -lt 1 ]]; then
  echo "FAIL: no published service pages"
  exit 1
fi

echo "=== disconnect JZ backend from shared avion network if attached ==="
docker network disconnect aviosupportdesk_avion jumpifzero-backend-1 2>/dev/null || true

echo "=== rebuild ONLY jumpifzero backend + frontend images ==="
docker compose --env-file "$JZ_SECRETS_FILE" build backend frontend

echo "=== recreate ONLY jumpifzero backend + frontend (postgres untouched) ==="
docker compose --env-file "$JZ_SECRETS_FILE" up -d --force-recreate --no-deps backend frontend

echo "=== ensure jumpifzero-frontend alias on nginx proxy network ==="
NGINX_NAME="$(docker ps --format '{{.Names}}' | grep -E '^aviosupportdesk-nginx' | head -n 1 || true)"
FRONTEND_ID="$(docker ps -qf name=jumpifzero-frontend-1 | head -n 1 || true)"
if [[ -z "$NGINX_NAME" || -z "$FRONTEND_ID" ]]; then
  echo "FAIL: missing nginx or jumpifzero-frontend"
  docker ps --format '{{.Names}} {{.Status}}'
  exit 1
fi
PROXY_NETWORK="$(docker inspect "$NGINX_NAME" --format '{{range $k,$v := .NetworkSettings.Networks}}{{println $k}}{{end}}' | head -n 1)"
echo "nginx=$NGINX_NAME proxy_network=$PROXY_NETWORK frontend=$FRONTEND_ID"
if ! docker exec "$NGINX_NAME" getent hosts jumpifzero-frontend >/dev/null 2>&1; then
  docker network disconnect "$PROXY_NETWORK" "$FRONTEND_ID" 2>/dev/null || true
  docker network connect --alias jumpifzero-frontend "$PROXY_NETWORK" "$FRONTEND_ID"
fi
# Always re-assert alias after recreate (idempotent connect)
docker network connect --alias jumpifzero-frontend "$PROXY_NETWORK" "$FRONTEND_ID" 2>/dev/null || true
docker exec "$NGINX_NAME" getent hosts jumpifzero-frontend
docker exec "$NGINX_NAME" nginx -t
docker exec "$NGINX_NAME" nginx -s reload

echo "=== wait backend on jz_internal ==="
for i in $(seq 1 30); do
  if docker compose --env-file "$JZ_SECRETS_FILE" exec -T frontend node --input-type=module -e \
    'const r=await fetch("http://backend.jumpifzero_jz_internal:3011/health/live"); if(r.status!==401&&r.status!==200) process.exit(1); console.log("backend_ok",r.status);' \
    2>/dev/null; then
    break
  fi
  echo "backend wait $i"
  sleep 2
  if [[ "$i" -eq 30 ]]; then
    echo "FAIL: frontend cannot reach backend:3011"
    docker compose --env-file "$JZ_SECRETS_FILE" logs --tail=50 backend
    exit 1
  fi
done

echo "=== wait frontend :3010 ==="
for i in $(seq 1 60); do
  if docker compose --env-file "$JZ_SECRETS_FILE" exec -T frontend node --input-type=module -e \
    'const r=await fetch("http://127.0.0.1:3010/"); console.log("frontend_ok",r.status); if(r.status!==200) process.exit(1);' \
    2>/dev/null; then
    break
  fi
  echo "frontend wait $i"
  sleep 2
  if [[ "$i" -eq 60 ]]; then
    echo "FAIL: frontend not serving :3010"
    docker compose --env-file "$JZ_SECRETS_FILE" logs --tail=80 frontend
    exit 1
  fi
done

echo "=== wait public $DOMAIN ==="
for i in $(seq 1 30); do
  code="$(curl -sk -o /dev/null -w '%{http_code}' --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" || true)"
  echo "public wait $i home=$code"
  if [[ "$code" == "200" ]]; then
    break
  fi
  sleep 2
  if [[ "$i" -eq 30 ]]; then
    echo "FAIL: public homepage not 200"
    exit 1
  fi
done

echo "=== smoke service pages ==="
FAIL=0
for path in \
  /services/custom-development \
  /services/seo \
  /services/design \
  /services/digital-marketing \
  /services/cyber-security \
  /services/custom-development/web-development \
  /services/seo/technical-seo
do
  code="$(curl -sk -o /dev/null -w '%{http_code}' --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}${path}")"
  echo "$code  $path"
  if [[ "$code" != "200" ]]; then
    FAIL=1
  fi
done

echo "=== SAFETY after ==="
docker ps --format '{{.Names}} {{.Status}}' | grep -E 'aviosupport|flightbugs|quantara|jumpifzero' || true
for host in aviosupportdesk.com flightbugs.com quantarafinancial.info; do
  echo -n "$host "
  curl -sI -H "Host: $host" http://127.0.0.1 | head -n 1 || true
done

if [[ "$FAIL" -ne 0 ]]; then
  echo "FAIL: one or more service pages not 200"
  docker compose --env-file "$JZ_SECRETS_FILE" logs --tail=60 frontend
  docker compose --env-file "$JZ_SECRETS_FILE" logs --tail=60 backend
  exit 1
fi

echo "=== DONE: JumpIfZero runtime healthy ==="
