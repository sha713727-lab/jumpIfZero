#!/usr/bin/env bash
set -euo pipefail

SECRETS_FILE="${JZ_SECRETS_FILE:-/root/jz-secrets.env}"
APP_ROOT="${JZ_APP_ROOT:-/var/www/jumpifzero}"
REPO_SRC="${JZ_REPO_SRC:-$APP_ROOT}"

echo "=== postgres isolate (jumpifzero DB; no dev seeds) ==="

if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "missing $SECRETS_FILE"
  exit 1
fi
# shellcheck disable=SC1090
source "$SECRETS_FILE"

ROLES_SQL="$REPO_SRC/database/roles/001_roles.sql"
MIG_DIR="$REPO_SRC/database/migrations"
if [[ ! -f "$ROLES_SQL" ]]; then
  echo "missing $ROLES_SQL"
  exit 1
fi

if ! sudo -u postgres psql -Atc "SELECT 1 FROM pg_database WHERE datname='jumpifzero'" | grep -q 1; then
  sudo -u postgres createdb jumpifzero
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 -d jumpifzero -f "$ROLES_SQL"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d jumpifzero -c "ALTER ROLE jz_owner PASSWORD '${JZ_OWNER_PASSWORD}'"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d jumpifzero -c "ALTER ROLE jz_app PASSWORD '${JZ_APP_PASSWORD}'"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d jumpifzero -c "ALTER ROLE jz_readonly PASSWORD '${JZ_READONLY_PASSWORD}'"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER DATABASE jumpifzero OWNER TO jz_owner"

export PGPASSWORD="$JZ_OWNER_PASSWORD"

applied() {
  local version="$1"
  psql -h 127.0.0.1 -U jz_owner -d jumpifzero -Atc \
    "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='schema_migrations'" 2>/dev/null | grep -q 1 || return 1
  psql -h 127.0.0.1 -U jz_owner -d jumpifzero -Atc \
    "SELECT 1 FROM schema_migrations WHERE version='${version}'" 2>/dev/null | grep -q 1
}

shopt -s nullglob
mapfile -t UPS < <(ls -1 "$MIG_DIR"/*.up.sql | sort)
for f in "${UPS[@]}"; do
  version="$(basename "$f" .up.sql)"
  checksum="$(sha256sum "$f" | awk '{print $1}')"
  if applied "$version"; then
    echo "skip ${version}"
    continue
  fi
  echo "apply ${version}"
  psql -h 127.0.0.1 -U jz_owner -d jumpifzero -v ON_ERROR_STOP=1 -f "$f"
  psql -h 127.0.0.1 -U jz_owner -d jumpifzero -v ON_ERROR_STOP=1 -c \
    "INSERT INTO schema_migrations (version, checksum) VALUES ('${version}', '${checksum}') ON CONFLICT (version) DO NOTHING"
done

echo "=== postgres ready (no seeds) ==="
psql -h 127.0.0.1 -U jz_owner -d jumpifzero -c "SELECT version FROM schema_migrations ORDER BY version"
