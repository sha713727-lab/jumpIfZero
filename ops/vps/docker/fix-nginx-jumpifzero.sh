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

echo "=== listeners on host :80 / :443 ==="
ss -tlnp 2>/dev/null | grep -E ':80 |:443 ' || netstat -tlnp 2>/dev/null | grep -E ':80 |:443 ' || true
echo "=== docker port publish ($NGINX_NAME) ==="
docker port "$NGINX_NAME" || true

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

cert_covers_domain() {
  local pem="$1"
  [[ -f "$pem" ]] || return 1
  openssl x509 -in "$pem" -noout -text 2>/dev/null \
    | grep -E "CN[[:space:]]*=[[:space:]]*${DOMAIN}|DNS:${DOMAIN}(,|$| )" >/dev/null
}

NEED_CERT=0
if [[ ! -f "$CERT_DIR/fullchain.pem" || ! -f "$CERT_DIR/privkey.pem" ]]; then
  NEED_CERT=1
elif ! cert_covers_domain "$CERT_DIR/fullchain.pem"; then
  echo "=== existing cert does not cover $DOMAIN — recreating ==="
  NEED_CERT=1
fi

if [[ "$NEED_CERT" -eq 1 ]]; then
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
echo "=== origin cert subject ==="
openssl x509 -in "$CERT_DIR/fullchain.pem" -noout -subject -dates

HOST_DEFAULT_CONF="$(docker inspect "$NGINX_ID" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d/default.conf"}}{{println .Source}}{{end}}{{end}}' | head -n 1)"
HOST_CONF_DIR="$(docker inspect "$NGINX_ID" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d"}}{{println .Source}}{{end}}{{end}}' | head -n 1)"

SNIPPET_UNIX="$(mktemp)"
tr -d '\r' < "$SNIPPET" > "$SNIPPET_UNIX"

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

remove_jz_from_foreign_servernames() {
  local file="$1"
  local tmp
  tmp="$(mktemp)"
  awk -v d="$DOMAIN" '
    BEGIN { www="www." d }
    /^[[:space:]]*server_name[[:space:]]/ {
      line=$0
      gsub("www\\." d, "", line)
      gsub(d, "", line)
      print line
      next
    }
    { print }
  ' "$file" > "$tmp"
  cat "$tmp" > "$file"
  rm -f "$tmp"
}

overwrite_bind_file() {
  local host_path="$1"
  local content_file="$2"
  cat "$content_file" > "$host_path"
}

BAK=""
if [[ -n "$HOST_CONF_DIR" && -d "$HOST_CONF_DIR" && -z "$HOST_DEFAULT_CONF" ]]; then
  tr -d '\r' < "$SNIPPET_UNIX" > "$HOST_CONF_DIR/jumpifzero.conf"
  echo "wrote $HOST_CONF_DIR/jumpifzero.conf"
elif [[ -n "$HOST_DEFAULT_CONF" && -f "$HOST_DEFAULT_CONF" ]]; then
  BAK="${HOST_DEFAULT_CONF}.bak.jz.$(date +%Y%m%d%H%M%S)"
  cp -a "$HOST_DEFAULT_CONF" "$BAK"
  TMP_BASE="$(mktemp)"
  TMP_OUT="$(mktemp)"
  strip_managed_block "$HOST_DEFAULT_CONF" "$TMP_BASE"
  tr -d '\r' < "$TMP_BASE" > "${TMP_BASE}.lf"
  mv "${TMP_BASE}.lf" "$TMP_BASE"
  remove_jz_from_foreign_servernames "$TMP_BASE"
  {
    cat "$SNIPPET_UNIX"
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
  rm -f "$SNIPPET_UNIX"
  exit 1
fi
rm -f "$SNIPPET_UNIX"

echo "=== nginx -t (show conflicts) ==="
NGINX_TEST="$(docker exec "$NGINX_ID" nginx -t 2>&1)" || true
echo "$NGINX_TEST"
if echo "$NGINX_TEST" | grep -qi 'conflicting server name'; then
  echo "WARN: conflicting server_name detected — first matching block wins"
fi
if ! echo "$NGINX_TEST" | grep -qi 'successful'; then
  if [[ -n "$BAK" && -f "$BAK" ]]; then
    overwrite_bind_file "$HOST_DEFAULT_CONF" "$BAK"
  fi
  exit 1
fi
docker exec "$NGINX_ID" nginx -s reload

echo "=== listen/server_name map (port 80) ==="
docker exec "$NGINX_ID" nginx -T 2>/dev/null | awk '
  /server[[:space:]]*\{/ { in_server=1; listen=""; names=""; next }
  in_server && /listen[[:space:]]/ { listen=listen " " $0 }
  in_server && /server_name[[:space:]]/ { names=names " " $0 }
  in_server && /^\}/ {
    if (listen ~ /80/) print listen " |" names
    in_server=0
  }
' | head -n 40

echo "=== nginx -T jumpifzero markers ==="
docker exec "$NGINX_ID" nginx -T 2>/dev/null | grep -E 'X-JumpIfZero|server_name jumpifzero|jumpifzero-frontend' | head -n 20

echo "=== HTTP check INSIDE nginx container ==="
IN_HEADERS="$(docker exec "$NGINX_ID" curl -sI -H "Host: ${DOMAIN}" "http://127.0.0.1/" | tr -d '\r' || true)"
echo "$IN_HEADERS" | head -n 25

NGINX_IP="$(docker inspect "$NGINX_ID" --format '{{range $k,$v := .NetworkSettings.Networks}}{{.IPAddress}}{{println}}{{end}}' | head -n 1)"
echo "=== HTTP check via container IP (${NGINX_IP}) ==="
IP_HEADERS=""
if [[ -n "$NGINX_IP" ]]; then
  IP_HEADERS="$(curl -sI -H "Host: ${DOMAIN}" "http://${NGINX_IP}/" | tr -d '\r' || true)"
  echo "$IP_HEADERS" | head -n 25
fi

echo "=== HTTP check via host 127.0.0.1:80 ==="
HOST_HEADERS="$(curl -sI -H "Host: ${DOMAIN}" "http://127.0.0.1/" | tr -d '\r' || true)"
echo "$HOST_HEADERS" | head -n 25

headers_ok() {
  local h="$1"
  echo "$h" | grep -qi '^X-JumpIfZero:' && ! echo "$h" | grep -qi 'aviosupportdesk'
}

if headers_ok "$IN_HEADERS"; then
  echo "OK: jumpifzero vhost active inside nginx container"
elif headers_ok "$IP_HEADERS"; then
  echo "OK: jumpifzero vhost active on container IP"
else
  echo "FAIL: jumpifzero vhost not selected inside docker nginx"
  echo "Paste output of: docker exec $NGINX_NAME nginx -T 2>&1 | head -n 200"
  exit 1
fi

if ! headers_ok "$HOST_HEADERS"; then
  echo "FAIL: host :80 is not serving the jumpifzero vhost (different process or publish map)"
  echo "=== diagnose host vs docker ==="
  ss -tlnp 2>/dev/null | grep -E ':80 |:443 ' || true
  docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep -E 'nginx|jumpifzero|avio' || true
  exit 1
fi

echo "=== origin SNI check ==="
SNI_HEADERS="$(curl -skI --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" | tr -d '\r')"
echo "$SNI_HEADERS" | head -n 25
if ! echo "$SNI_HEADERS" | grep -qi '^X-JumpIfZero:'; then
  echo "FAIL: jumpifzero TLS vhost not active on :443"
  exit 1
fi
echo "--- title ---"
curl -sk --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/" | tr '\n' ' ' | sed 's/.*<title>//;s/<\/title>.*//' | head -c 160
echo
echo
echo "=== public HTTPS check ==="
curl -sI "https://${DOMAIN}/" | head -n 20 || true
echo "--- title ---"
curl -sk "https://${DOMAIN}/" | tr '\n' ' ' | sed 's/.*<title>//;s/<\/title>.*//' | head -c 160
echo
echo
echo "If the browser still warns: enable Cloudflare Proxied (orange cloud) for ${DOMAIN},"
echo "or install a trusted origin cert (Cloudflare Origin CA / Let's Encrypt)."
