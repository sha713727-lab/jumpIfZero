#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "run as root"
  exit 1
fi

DOMAIN="${JZ_DOMAIN:-jumpifzero.com}"
APP_ROOT="${JZ_APP_ROOT:-/var/www/jumpifzero}"
COMPOSE_DIR="$APP_ROOT/ops/vps/docker"
SNIPPET="$COMPOSE_DIR/nginx-jumpifzero.conf"

NGINX_ID="$(docker ps -qf name=aviosupportdesk-nginx)"
if [[ -z "$NGINX_ID" ]]; then
  echo "aviosupportdesk-nginx not running"
  exit 1
fi

PROXY_NETWORK="$(docker inspect "$NGINX_ID" --format '{{range $k,$v := .NetworkSettings.Networks}}{{println $k}}{{end}}' | head -n 1)"
FRONTEND_ID="$(docker ps -qf name=jumpifzero-frontend)"
if [[ -z "$FRONTEND_ID" ]]; then
  echo "jumpifzero-frontend not running"
  exit 1
fi

echo "=== ensure frontend on proxy network ($PROXY_NETWORK) ==="
if ! docker exec "$NGINX_ID" getent hosts jumpifzero-frontend >/dev/null 2>&1; then
  docker network disconnect "$PROXY_NETWORK" "$FRONTEND_ID" 2>/dev/null || true
  docker network connect --alias jumpifzero-frontend "$PROXY_NETWORK" "$FRONTEND_ID"
fi
if ! docker exec "$NGINX_ID" getent hosts jumpifzero-frontend; then
  echo "nginx cannot resolve jumpifzero-frontend"
  docker network inspect "$PROXY_NETWORK" --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}'
  exit 1
fi

LE_LIVE_HOST="$(docker inspect "$NGINX_ID" --format '{{range .Mounts}}{{if eq .Destination "/etc/letsencrypt"}}{{println .Source}}{{end}}{{end}}' | head -n 1)"
if [[ -z "$LE_LIVE_HOST" ]]; then
  echo "letsencrypt mount not found"
  exit 1
fi

CERT_DIR="$LE_LIVE_HOST/live/$DOMAIN"
mkdir -p "$CERT_DIR"
if [[ ! -f "$CERT_DIR/fullchain.pem" || ! -f "$CERT_DIR/privkey.pem" ]]; then
  echo "=== create origin TLS cert for $DOMAIN (Cloudflare Full) ==="
  if ! openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out "$CERT_DIR/fullchain.pem" \
    -subj "/CN=$DOMAIN" \
    -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN" 2>/dev/null; then
    openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
      -keyout "$CERT_DIR/privkey.pem" \
      -out "$CERT_DIR/fullchain.pem" \
      -subj "/CN=$DOMAIN"
  fi
fi
chmod 644 "$CERT_DIR/fullchain.pem" "$CERT_DIR/privkey.pem"

HOST_DEFAULT_CONF="$(docker inspect "$NGINX_ID" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d/default.conf"}}{{println .Source}}{{end}}{{end}}' | head -n 1)"
HOST_CONF_DIR="$(docker inspect "$NGINX_ID" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d"}}{{println .Source}}{{end}}{{end}}' | head -n 1)"

strip_managed_block() {
  local file="$1"
  if grep -q '# --- jumpifzero (managed by install-docker.sh) ---' "$file"; then
    awk '
      /# --- jumpifzero \(managed by install-docker\.sh\) ---/ {skip=1; next}
      /# --- end jumpifzero ---/ {skip=0; next}
      skip {next}
      {print}
    ' "$file" > "${file}.jz.tmp"
    mv "${file}.jz.tmp" "$file"
  fi
}

if [[ -n "$HOST_CONF_DIR" && -d "$HOST_CONF_DIR" ]]; then
  cp "$SNIPPET" "$HOST_CONF_DIR/jumpifzero.conf"
  echo "wrote $HOST_CONF_DIR/jumpifzero.conf"
elif [[ -n "$HOST_DEFAULT_CONF" && -f "$HOST_DEFAULT_CONF" ]]; then
  BAK="${HOST_DEFAULT_CONF}.bak.jz.$(date +%Y%m%d%H%M%S)"
  cp -a "$HOST_DEFAULT_CONF" "$BAK"
  strip_managed_block "$HOST_DEFAULT_CONF"
  echo "=== server_name lines mentioning jumpifzero (should be none before prepend) ==="
  grep -n 'jumpifzero' "$HOST_DEFAULT_CONF" || echo "(none)"
  {
    cat "$SNIPPET"
    echo
    cat "$HOST_DEFAULT_CONF"
  } > "${HOST_DEFAULT_CONF}.jz.new"
  mv "${HOST_DEFAULT_CONF}.jz.new" "$HOST_DEFAULT_CONF"
  echo "prepended jumpifzero block in $HOST_DEFAULT_CONF (backup $BAK)"
else
  echo "nginx conf mount not found"
  docker inspect "$NGINX_ID" --format '{{json .Mounts}}'
  exit 1
fi

if ! docker exec "$NGINX_ID" nginx -t; then
  if [[ -n "${BAK:-}" && -f "$BAK" ]]; then
    cp -a "$BAK" "$HOST_DEFAULT_CONF"
  fi
  exit 1
fi
docker exec "$NGINX_ID" nginx -s reload

echo "=== origin with correct SNI (must be JumpIfZero, header X-JumpIfZero: 1) ==="
curl -skI --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" | head -n 20
echo "--- body title ---"
curl -sk --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" | tr '\n' ' ' | sed 's/.*<title>//;s/<\/title>.*//' | head -c 120
echo
echo
echo "=== via Cloudflare edge ==="
curl -sI "https://${DOMAIN}/" | head -n 25
echo "--- body title ---"
curl -s "https://${DOMAIN}/" | tr '\n' ' ' | sed 's/.*<title>//;s/<\/title>.*//' | head -c 120
echo
echo
echo "If origin title is JumpIfZero but Cloudflare title is Avion: purge CF cache + enable Development Mode."
echo "If origin title is Avion: paste grep -n server_name $HOST_DEFAULT_CONF | head -40"
