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

NGINX_NAME="$(docker ps --format '{{.Names}}' | grep -E 'aviosupportdesk-nginx' | head -n 1)"
if [[ -z "$NGINX_NAME" ]]; then
  echo "aviosupportdesk-nginx not running"
  exit 1
fi
NGINX_ID="$(docker inspect -f '{{.Id}}' "$NGINX_NAME")"

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
docker exec "$NGINX_ID" getent hosts jumpifzero-frontend

echo "=== frontend HTTP check ==="
FE_CODE="$(docker exec "$FRONTEND_ID" node -e "fetch('http://127.0.0.1:3010/').then(async r=>{console.log(r.status); const t=await r.text(); const m=t.match(/<title>([^<]*)<\\/title>/i); console.log(m?m[1]:'NO_TITLE'); console.log(t.slice(0,80).replace(/\\n/g,' '));}).catch(e=>{console.log('ERR'); console.log(String(e)); process.exit(1);})")"
echo "$FE_CODE"

LE_LIVE_HOST="$(docker inspect "$NGINX_ID" --format '{{range .Mounts}}{{if eq .Destination "/etc/letsencrypt"}}{{println .Source}}{{end}}{{end}}' | head -n 1)"
if [[ -z "$LE_LIVE_HOST" ]]; then
  echo "letsencrypt mount not found"
  exit 1
fi

CERT_DIR="$LE_LIVE_HOST/live/$DOMAIN"
mkdir -p "$CERT_DIR"
if [[ ! -f "$CERT_DIR/fullchain.pem" || ! -f "$CERT_DIR/privkey.pem" ]]; then
  echo "=== create origin TLS cert for $DOMAIN ==="
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
  local src="$1"
  local dest="$2"
  if grep -q '# --- jumpifzero (managed by install-docker.sh) ---' "$src"; then
    awk '
      /# --- jumpifzero \(managed by install-docker\.sh\) ---/ {skip=1; next}
      /# --- end jumpifzero ---/ {skip=0; next}
      skip {next}
      {print}
    ' "$src" > "$dest"
  else
    cat "$src" > "$dest"
  fi
}

# Bind-mounted file: overwrite same inode only. Never mv/docker cp onto the mount path.
overwrite_bind_file() {
  local host_path="$1"
  local content_file="$2"
  cat "$content_file" > "$host_path"
}

if [[ -n "$HOST_CONF_DIR" && -d "$HOST_CONF_DIR" ]]; then
  cp "$SNIPPET" "$HOST_CONF_DIR/jumpifzero.conf"
  echo "wrote $HOST_CONF_DIR/jumpifzero.conf"
elif [[ -n "$HOST_DEFAULT_CONF" && -f "$HOST_DEFAULT_CONF" ]]; then
  BAK="${HOST_DEFAULT_CONF}.bak.jz.$(date +%Y%m%d%H%M%S)"
  cp -a "$HOST_DEFAULT_CONF" "$BAK"
  TMP_BASE="$(mktemp)"
  TMP_OUT="$(mktemp)"
  strip_managed_block "$HOST_DEFAULT_CONF" "$TMP_BASE"
  {
    cat "$SNIPPET"
    echo
    cat "$TMP_BASE"
  } > "$TMP_OUT"
  overwrite_bind_file "$HOST_DEFAULT_CONF" "$TMP_OUT"
  rm -f "$TMP_BASE" "$TMP_OUT"
  echo "wrote jumpifzero block into $HOST_DEFAULT_CONF (backup $BAK)"
  echo "=== host file head ==="
  head -n 8 "$HOST_DEFAULT_CONF"
  echo "=== container file head (must match) ==="
  docker exec "$NGINX_ID" head -n 8 /etc/nginx/conf.d/default.conf
else
  echo "nginx conf mount not found"
  docker inspect "$NGINX_ID" --format '{{json .Mounts}}'
  exit 1
fi

if ! docker exec "$NGINX_ID" nginx -t; then
  if [[ -n "${BAK:-}" && -f "$BAK" ]]; then
    overwrite_bind_file "$HOST_DEFAULT_CONF" "$BAK"
  fi
  exit 1
fi
docker exec "$NGINX_ID" nginx -s reload

echo "=== nginx -T jumpifzero markers ==="
docker exec "$NGINX_ID" nginx -T 2>/dev/null | grep -E 'X-JumpIfZero|server_name jumpifzero|jumpifzero-frontend' | head -n 20

echo "=== origin SNI check ==="
curl -skI --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" | head -n 25
echo "--- title ---"
curl -sk --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" | tr '\n' ' ' | sed 's/.*<title>//;s/<\/title>.*//' | head -c 160
echo
echo
echo "=== cloudflare check ==="
curl -sI "https://${DOMAIN}/" | head -n 20
echo "--- title ---"
curl -s "https://${DOMAIN}/" | tr '\n' ' ' | sed 's/.*<title>//;s/<\/title>.*//' | head -c 160
echo
