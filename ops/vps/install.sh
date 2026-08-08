#!/usr/bin/env bash
set -euo pipefail

# Orchestrates JumpIfZero second-site install on a shared Ubuntu VPS.
# Does not modify other nginx sites or Docker containers.

OPS_DIR="$(cd "$(dirname "$0")" && pwd)"
export JZ_SECRETS_FILE="${JZ_SECRETS_FILE:-/root/jz-secrets.env}"
export JZ_APP_ROOT="${JZ_APP_ROOT:-/var/www/jumpifzero}"
export JZ_DOMAIN="${JZ_DOMAIN:-jumpifzero.com}"
export JZ_REPO_URL="${JZ_REPO_URL:-https://github.com/sha713727-lab/jumpIfZero.git}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "run as root"
  exit 1
fi

if [[ -z "${JZ_VPS_IPV4:-}" ]]; then
  echo "Set JZ_VPS_IPV4 to the Hostinger Overview IPv4 before running."
  exit 1
fi

chmod +x "$OPS_DIR"/scripts/*.sh

echo "=== 00 gate ==="
bash "$OPS_DIR/scripts/00-gate.sh"

echo "=== generate secrets if missing ==="
if [[ ! -f "$JZ_SECRETS_FILE" ]]; then
  umask 077
  JZ_OWNER_PASSWORD="$(openssl rand -base64 32 | tr -d '\n')"
  JZ_APP_PASSWORD="$(openssl rand -base64 32 | tr -d '\n')"
  JZ_READONLY_PASSWORD="$(openssl rand -base64 32 | tr -d '\n')"
  JZ_HMAC_SECRET="$(openssl rand -base64 48 | tr -d '\n' | head -c 48)"
  JZ_SESSION_SECRET="$(openssl rand -base64 48 | tr -d '\n' | head -c 48)"
  JZ_TAX_ID_AEAD_KEY="$(openssl rand -base64 32 | tr -d '\n')"
  JZ_HMAC_GATEWAY_SUBJECT_ID="$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen)"
  JZ_DEMO_ADMIN_EMAIL="admin@${JZ_DOMAIN}"
  JZ_DEMO_ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '\n')"
  JZ_DEMO_EMPLOYEE_PASSWORD="$(openssl rand -base64 18 | tr -d '\n')"
  JZ_DEMO_CUSTOMER_PASSWORD="$(openssl rand -base64 18 | tr -d '\n')"
  cat > "$JZ_SECRETS_FILE" <<EOF
# Generated $(date -u +%Y-%m-%dT%H:%M:%SZ) — do not commit
JZ_OWNER_PASSWORD=${JZ_OWNER_PASSWORD}
JZ_APP_PASSWORD=${JZ_APP_PASSWORD}
JZ_READONLY_PASSWORD=${JZ_READONLY_PASSWORD}
JZ_HMAC_SECRET=${JZ_HMAC_SECRET}
JZ_SESSION_SECRET=${JZ_SESSION_SECRET}
JZ_TAX_ID_AEAD_KEY=${JZ_TAX_ID_AEAD_KEY}
JZ_HMAC_GATEWAY_SUBJECT_ID=${JZ_HMAC_GATEWAY_SUBJECT_ID}
JZ_DEMO_ADMIN_EMAIL=${JZ_DEMO_ADMIN_EMAIL}
JZ_DEMO_ADMIN_PASSWORD=${JZ_DEMO_ADMIN_PASSWORD}
JZ_DEMO_EMPLOYEE_PASSWORD=${JZ_DEMO_EMPLOYEE_PASSWORD}
JZ_DEMO_CUSTOMER_PASSWORD=${JZ_DEMO_CUSTOMER_PASSWORD}
EOF
  chmod 600 "$JZ_SECRETS_FILE"
  echo "wrote $JZ_SECRETS_FILE"
else
  echo "using existing $JZ_SECRETS_FILE"
fi

echo "=== 01 deps ==="
bash "$OPS_DIR/scripts/01-install-deps.sh"

# Ensure scram host auth for app roles (does not rewrite unrelated lines)
PG_HBA="$(ls /etc/postgresql/*/main/pg_hba.conf 2>/dev/null | sort | tail -n 1 || true)"
if [[ -n "$PG_HBA" ]] && ! grep -q 'jumpifzero jz_app' "$PG_HBA"; then
  echo "host    jumpifzero      jz_owner,jz_app,jz_readonly 127.0.0.1/32      scram-sha-256" >>"$PG_HBA"
  echo "host    jumpifzero      jz_owner,jz_app,jz_readonly ::1/128           scram-sha-256" >>"$PG_HBA"
  systemctl reload postgresql || systemctl restart postgresql
fi

echo "=== clone for migrations source ==="
if [[ ! -d "$JZ_APP_ROOT/.git" ]]; then
  git clone "$JZ_REPO_URL" "$JZ_APP_ROOT"
fi
export JZ_REPO_SRC="$JZ_APP_ROOT"

echo "=== 02 postgres ==="
bash "$OPS_DIR/scripts/02-setup-postgres.sh"

echo "=== 03 app ==="
bash "$OPS_DIR/scripts/03-deploy-app.sh"

echo "=== 04 nginx/ssl ==="
bash "$OPS_DIR/scripts/04-nginx-ssl.sh"

echo
echo "=== DONE ==="
echo "Domain: https://${JZ_DOMAIN}"
echo "Secrets: ${JZ_SECRETS_FILE}"
echo "Confirm Cloudflare A @ and www → ${JZ_VPS_IPV4}, SSL Full (strict) after cert."
echo "Site-1 nginx/docker configs were not removed."
