#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "run as root"
  exit 1
fi

DOMAIN="${JZ_DOMAIN:-jumpifzero.com}"
APP_ROOT="${JZ_APP_ROOT:-/var/www/jumpifzero}"
SECRETS_FILE="${JZ_SECRETS_FILE:-/root/jz-secrets.env}"
COMPOSE_DIR="$APP_ROOT/ops/vps/docker"
SEED_DIR="$APP_ROOT/database/seeds/prod"

if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "missing $SECRETS_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$SECRETS_FILE"
set +a

: "${JZ_DEMO_ADMIN_EMAIL:?}"
: "${JZ_DEMO_ADMIN_PASSWORD:?}"
: "${JZ_DEMO_EMPLOYEE_PASSWORD:?}"
: "${JZ_HMAC_GATEWAY_SUBJECT_ID:?}"

ADMIN_EMAIL="$(echo "$JZ_DEMO_ADMIN_EMAIL" | tr '[:upper:]' '[:lower:]')"
DELIVERY_EMAIL="delivery@${DOMAIN}"
SALES_EMAIL="sales@${DOMAIN}"

cd "$COMPOSE_DIR"
export JZ_PROXY_NETWORK="${JZ_PROXY_NETWORK:-aviosupportdesk_avion}"

echo "=== ensure HMAC_GATEWAY_SUBJECT_ID in frontend.env ==="
if [[ -f /etc/jumpifzero/frontend.env ]]; then
  if grep -q '^HMAC_GATEWAY_SUBJECT_ID=' /etc/jumpifzero/frontend.env; then
    sed -i "s|^HMAC_GATEWAY_SUBJECT_ID=.*|HMAC_GATEWAY_SUBJECT_ID=${JZ_HMAC_GATEWAY_SUBJECT_ID}|" /etc/jumpifzero/frontend.env
  else
    echo "HMAC_GATEWAY_SUBJECT_ID=${JZ_HMAC_GATEWAY_SUBJECT_ID}" >> /etc/jumpifzero/frontend.env
  fi
  docker compose --env-file "$SECRETS_FILE" up -d --force-recreate frontend
  sleep 2
fi

hash_password() {
  local pw="$1"
  docker exec -w /app -e JZ_PW="$pw" jumpifzero-backend-1 node -e \
    'const argon2=require("argon2"); argon2.hash(process.env.JZ_PW,{type:argon2.argon2id,memoryCost:65536,timeCost:3,parallelism:1}).then((h)=>process.stdout.write(h));'
}

echo "=== hash passwords ==="
ADMIN_HASH="$(hash_password "$JZ_DEMO_ADMIN_PASSWORD")"
EMP_HASH="$(hash_password "$JZ_DEMO_EMPLOYEE_PASSWORD")"

USERS_SQL="$(mktemp)"
cat > "$USERS_SQL" <<EOF
BEGIN;

INSERT INTO users (email, password_hash, name, title, role)
SELECT '${ADMIN_EMAIL}', \$jz\$${ADMIN_HASH}\$jz\$, 'Owner', 'Founder', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = '${ADMIN_EMAIL}' AND archived_at IS NULL
);

INSERT INTO users (email, password_hash, name, title, role)
SELECT '${DELIVERY_EMAIL}', \$jz\$${EMP_HASH}\$jz\$, 'Delivery Lead', 'Delivery Lead', 'employee'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = '${DELIVERY_EMAIL}' AND archived_at IS NULL
);

INSERT INTO users (email, password_hash, name, title, role)
SELECT '${SALES_EMAIL}', \$jz\$${EMP_HASH}\$jz\$, 'Sales Lead', 'Sales Lead', 'employee'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = '${SALES_EMAIL}' AND archived_at IS NULL
);

INSERT INTO employees (user_id, title, department, kind, image_path)
SELECT u.id, 'Delivery Lead', 'Delivery', 'delivery', ''
FROM users u
WHERE u.email = '${DELIVERY_EMAIL}'
  AND u.archived_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.user_id = u.id);

INSERT INTO employees (user_id, title, department, kind, image_path)
SELECT u.id, 'Sales Lead', 'Sales', 'sales', ''
FROM users u
WHERE u.email = '${SALES_EMAIL}'
  AND u.archived_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.user_id = u.id);

COMMIT;
EOF

echo "=== users + employees ==="
docker compose --env-file "$SECRETS_FILE" exec -T postgres \
  psql -U postgres -d jumpifzero -v ON_ERROR_STOP=1 < "$USERS_SQL"
rm -f "$USERS_SQL"

echo "=== CMS ==="
docker compose --env-file "$SECRETS_FILE" exec -T postgres \
  psql -U postgres -d jumpifzero -v ON_ERROR_STOP=1 < "$SEED_DIR/001_cms.sql"

echo "=== site sections ==="
docker compose --env-file "$SECRETS_FILE" exec -T postgres \
  psql -U postgres -d jumpifzero -v ON_ERROR_STOP=1 < "$SEED_DIR/002_site_sections.sql"

echo "=== counts ==="
docker compose --env-file "$SECRETS_FILE" exec -T postgres \
  psql -U postgres -d jumpifzero -c \
  "SELECT (SELECT count(*) FROM users WHERE archived_at IS NULL) AS users,
          (SELECT count(*) FROM employees WHERE archived_at IS NULL) AS employees,
          (SELECT count(*) FROM services WHERE archived_at IS NULL) AS services,
          (SELECT count(*) FROM faqs WHERE archived_at IS NULL) AS faqs;"

echo
echo "=== logins ==="
echo "Admin:    https://${DOMAIN}/admin/login"
echo "  email:  ${ADMIN_EMAIL}"
echo "  pass:   (JZ_DEMO_ADMIN_PASSWORD in ${SECRETS_FILE})"
echo "Employee: https://${DOMAIN}/employee/login"
echo "  delivery email: ${DELIVERY_EMAIL}"
echo "  sales email:    ${SALES_EMAIL}"
echo "  pass:   (JZ_DEMO_EMPLOYEE_PASSWORD in ${SECRETS_FILE})"
echo
echo "Show passwords: grep -E '^JZ_DEMO_(ADMIN|EMPLOYEE)_' ${SECRETS_FILE}"
