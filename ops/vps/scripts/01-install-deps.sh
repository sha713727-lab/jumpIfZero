#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "=== install deps (idempotent; will not remove site-1 packages) ==="

apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release software-properties-common ufw

if ! command -v nginx >/dev/null 2>&1; then
  apt-get install -y nginx
fi

if ! command -v certbot >/dev/null 2>&1; then
  apt-get install -y certbot python3-certbot-nginx
fi

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE 'v2[4-9]\.'; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi

if ! command -v psql >/dev/null 2>&1; then
  install -d /usr/share/postgresql-common/pgdg
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    >/etc/apt/sources.list.d/pgdg.list
  apt-get update -y
  apt-get install -y postgresql-18 postgresql-client-18
  systemctl enable --now postgresql
fi

mkdir -p /var/www/certbot
id -u jumpifzero >/dev/null 2>&1 || useradd --system --home /var/www/jumpifzero --shell /usr/sbin/nologin jumpifzero
mkdir -p /var/www/jumpifzero /var/lib/jumpifzero/files /etc/jumpifzero
chown -R jumpifzero:jumpifzero /var/www/jumpifzero /var/lib/jumpifzero
chmod 750 /etc/jumpifzero

echo "node=$(node -v) npm=$(npm -v)"
echo "=== deps ready ==="
