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

echo "=== frontend title (must be JumpIfZero, not Avion) ==="
docker exec "$FRONTEND_ID" node -e "fetch('http://127.0.0.1:3010').then(r=>r.text()).then(t=>{const m=t.match(/<title>([^<]*)<\/title>/i); console.log(m?m[1]:'NO_TITLE');})"

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

# Bind-mounted files: never mv/replace the inode. Write via truncate-in-place or docker cp.
write_bind_file() {
  local host_path="$1"
  local content_file="$2"
  cat "$content_file" > "$host_path"
  docker cp "$content_file" "$NGINX_ID:/etc/nginx/conf.d/default.conf"
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
  write_bind_file "$HOST_DEFAULT_CONF" "$TMP_OUT"
  rm -f "$TMP_BASE" "$TMP_OUT"
  echo "wrote jumpifzero block into $HOST_DEFAULT_CONF (backup $BAK)"
else
  echo "nginx conf mount not found"
  docker inspect "$NGINX_ID" --format '{{json .Mounts}}'
  exit 1
fi

if ! docker exec "$NGINX_ID" nginx -t; then
  if [[ -n "${BAK:-}" && -f "${BAK:-}" ]]; then
    write_bind_file "$HOST_DEFAULT_CONF" "$BAK"
  fi
  exit 1
fi
docker exec "$NGINX_ID" nginx -s reload

echo "=== nginx must contain X-JumpIfZero ==="
docker exec "$NGINX_ID" nginx -T 2>/dev/null | grep -c 'X-JumpIfZero' || true

echo "=== origin with correct SNI ==="
curl -skI --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" | head -n 25
echo "--- title ---"
curl -sk --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" | tr '\n' ' ' | sed 's/.*<title>//;s/<\/title>.*//' | head -c 120
echo
echo
echo "=== via Cloudflare ==="
curl -sI "https://${DOMAIN}/" | head -n 25
echo "--- title ---"
curl -s "https://${DOMAIN}/" | tr '\n' ' ' | sed 's/.*<title>//;s/<\/title>.*//' | head -c 120
echo
echo
echo "Expect header X-JumpIfZero: 1 and a JumpIfZero title. Then purge Cloudflare cache."
