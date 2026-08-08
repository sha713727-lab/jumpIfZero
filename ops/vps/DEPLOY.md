# JumpIfZero — VPS second-site deploy

Deploy **jumpifzero.com** on an existing Hostinger Ubuntu VPS beside another live site.
Public traffic: Cloudflare → nginx (80/443) → Next.js `127.0.0.1:3010` → API `127.0.0.1:3011`.

Do not change the other site’s DNS, nginx vhost, or containers.

## 0. You: Cloudflare DNS (5 minutes)

1. Open [Cloudflare → jumpifzero.com → DNS → Records](https://dash.cloudflare.com).
2. Set A records to the **exact IPv4** from Hostinger VPS Overview (not a guessed IP):

   | Type | Name | Content | Proxy |
   | --- | --- | --- | --- |
   | A | `@` | `<VPS_IPV4>` | Proxied (orange) |
   | A | `www` | `<VPS_IPV4>` | Proxied (orange) |

3. SSL/TLS → Overview:
   - Before origin HTTPS exists: **Flexible** (or set A records to **DNS only** for Certbot)
   - After Let’s Encrypt / Origin cert on the VPS: **Full (strict)**
4. Leave every other domain’s DNS untouched.

## 1. You: SSH into the VPS

```bash
ssh root@<VPS_IPV4>
```

If SSH times out: Hostinger → VPS → Firewall — allow TCP 22 from your IP; confirm the Overview IPv4 matches Cloudflare.

## 2. Gate (required — do not skip)

Captures how site 1 is served so JumpIfZero attaches beside it.

```bash
cd /tmp
git clone --depth 1 https://github.com/sha713727-lab/jumpIfZero.git jz-ops-tmp
bash jz-ops-tmp/ops/vps/scripts/00-gate.sh | tee /root/jz-gate-$(date +%Y%m%d).txt
```

Read the report. If ports **3010** or **3011** are already in use, stop and change ports in the env files before continuing.

## 3. One-shot install (deps → DB → app → nginx)

```bash
export JZ_VPS_IPV4='<VPS_IPV4>'          # same IP as Cloudflare A records
export JZ_DOMAIN='jumpifzero.com'
export JZ_APP_ROOT='/var/www/jumpifzero'
# Optional: set strong passwords/secrets before install, or the script generates them once into /root/jz-secrets.env
bash /tmp/jz-ops-tmp/ops/vps/install.sh
```

What install does:

1. Installs Node 24, PostgreSQL 18 (PGDG), nginx, certbot **only if missing**
2. Creates database `jumpifzero` + roles; applies migrations `0001`–`0010`; **does not** load `database/seeds/dev`
3. Clones/pulls the repo to `/var/www/jumpifzero`, `npm ci`, production build
4. Writes env under `/etc/jumpifzero/` (not in git)
5. Enables systemd units on **3010** (web) and **3011** (API on localhost)
6. Enables nginx site for `jumpifzero.com` / `www` → `127.0.0.1:3010`
7. Issues Let’s Encrypt cert when DNS already points at this VPS

Secrets path: `/root/jz-secrets.env` (mode 600). Copy values you need; do not commit.

## 4. Verify

```bash
curl -sI https://jumpifzero.com | head -n 15
sudo systemctl status jumpifzero-backend jumpifzero-frontend --no-pager
ss -tlnp | grep -E '3010|3011'
# API must NOT listen on a public interface:
ss -tlnp | grep 3011
```

Expected: frontend on `127.0.0.1:3010`, backend on `127.0.0.1:3011`, site 1 still healthy on its own hostnames.

## 5. First admin user

Dev seeds are **not** applied in production. Create the first admin via SQL as `jz_owner` or your approved admin bootstrap path after migrate. Do not import synthetic `.example` seed accounts into production.

## Layout reference

| Path | Role |
| --- | --- |
| [nginx/jumpifzero.com.conf](./nginx/jumpifzero.com.conf) | Host-based reverse proxy |
| [systemd/jumpifzero-backend.service](./systemd/jumpifzero-backend.service) | API on 3011 |
| [systemd/jumpifzero-frontend.service](./systemd/jumpifzero-frontend.service) | Next on 3010 |
| [env/backend.env.example](./env/backend.env.example) | Backend env template |
| [env/frontend.env.example](./env/frontend.env.example) | Frontend env template |
| [scripts/](./scripts/) | Gate, deps, postgres, deploy, nginx/ssl |
| [install.sh](./install.sh) | Orchestrator |

## Rollback (JumpIfZero only)

```bash
sudo systemctl disable --now jumpifzero-frontend jumpifzero-backend
sudo rm -f /etc/nginx/sites-enabled/jumpifzero.com
sudo nginx -t && sudo systemctl reload nginx
```

Does not drop the database unless you explicitly run `dropdb`.
