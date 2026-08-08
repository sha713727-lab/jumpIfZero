#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${JZ_DOMAIN:-jumpifzero.com}"
OPS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EMAIL="${JZ_CERT_EMAIL:-HR@${DOMAIN}}"

echo "=== nginx + TLS for ${DOMAIN} ==="

install -d /var/www/certbot
install -m 644 "$OPS_DIR/nginx/jumpifzero.com.conf" /etc/nginx/sites-available/jumpifzero.com
ln -sfn /etc/nginx/sites-available/jumpifzero.com /etc/nginx/sites-enabled/jumpifzero.com

# Do not touch other enabled sites
nginx -t
systemctl reload nginx

if [[ "${JZ_SKIP_CERTBOT:-0}" == "1" ]]; then
  echo "JZ_SKIP_CERTBOT=1 — skipped Let's Encrypt. Use Cloudflare Full + Origin cert or rerun later."
  exit 0
fi

# Cloudflare orange-cloud can break HTTP-01. If this fails, set SSL to DNS-only briefly or use DNS challenge.
if certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "$EMAIL" --redirect; then
  echo "certbot OK — set Cloudflare SSL/TLS to Full (strict)"
else
  echo "certbot failed (common while Cloudflare proxy is on)."
  echo "Options: (1) temporarily set A records to DNS-only, rerun this script;"
  echo "         (2) upload a Cloudflare Origin Certificate and enable Full (strict)."
  exit 0
fi

nginx -t
systemctl reload nginx
echo "=== nginx ready ==="
