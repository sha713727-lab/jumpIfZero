#!/usr/bin/env bash
set -euo pipefail

echo "=== JumpIfZero VPS gate (site-1 discovery) ==="
echo "host=$(hostname -f 2>/dev/null || hostname)"
echo "date=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo

echo "--- nginx ---"
if command -v nginx >/dev/null 2>&1; then
  nginx -t 2>&1 || true
  echo "sites-enabled:"
  ls -la /etc/nginx/sites-enabled 2>/dev/null || echo "(none)"
else
  echo "nginx not installed"
fi
echo

echo "--- docker ---"
if command -v docker >/dev/null 2>&1; then
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null || true
else
  echo "docker not installed"
fi
echo

echo "--- listening ports ---"
ss -tlnp 2>/dev/null | head -n 80 || netstat -tlnp 2>/dev/null | head -n 80 || true
echo

echo "--- port collision check (3010 / 3011) ---"
if ss -tlnp 2>/dev/null | grep -E ':(3010|3011)\s' >/dev/null; then
  echo "BLOCKER: 3010 or 3011 already in use. Pick different ports before install."
  ss -tlnp | grep -E ':(3010|3011)\s' || true
  exit 1
fi
echo "OK: 3010 and 3011 are free"
echo

echo "=== gate complete ==="
