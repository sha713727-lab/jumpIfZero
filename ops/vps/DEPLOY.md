# JumpIfZero — VPS second-site deploy

Deploy **jumpifzero.com** on a Hostinger Ubuntu VPS **beside** an existing Docker site (example: `aviosupportdesk`), without taking over ports 80/443.

## Architecture (Docker-first)

Site 1 already runs `aviosupportdesk-nginx` on host `:80` / `:443`. JumpIfZero runs as its own Compose stack and joins that nginx network. Nginx routes by `Host` header.

```text
Cloudflare → aviosupportdesk-nginx (:80/:443)
               ├─ site1.com        → aviosupportdesk-frontend
               └─ jumpifzero.com   → jumpifzero-frontend:3010
                    └─ backend:3011 → postgres (JZ only)
```

Do **not** install/start host `nginx` or host Postgres for this path.

## 0. Cloudflare DNS

- `A` `@` → VPS IPv4 (Proxied)
- `CNAME` `www` → `jumpifzero.com` (Proxied)
- SSL: keep working as for site 1; add JumpIfZero cert to that nginx when needed

## 1. On the VPS (Web console / SSH)

If a previous host install partially ran:

```bash
systemctl disable --now nginx 2>/dev/null || true
```

Then:

```bash
rm -rf /tmp/jz
git clone --depth 1 https://github.com/sha713727-lab/jumpIfZero.git /tmp/jz
export JZ_DOMAIN='jumpifzero.com'
bash /tmp/jz/ops/vps/docker/install-docker.sh
```

Secrets: `/root/jz-secrets.env` (mode 600).

## 2. Verify

```bash
curl -sI -H 'Host: jumpifzero.com' http://127.0.0.1 | head
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'jumpifzero|aviosupport'
```

Site 1 must still respond on its own domain.

## 2b. Production bootstrap (users + CMS)

After the stack is healthy, seed admin/employee logins and public CMS (no CRM freight seeds):

```bash
export JZ_DOMAIN='jumpifzero.com'
export JZ_PROXY_NETWORK=aviosupportdesk_avion
bash /var/www/jumpifzero/ops/vps/docker/bootstrap-prod.sh
grep -E '^JZ_DEMO_(ADMIN|EMPLOYEE)_' /root/jz-secrets.env
```

## Files

| Path | Role |
| --- | --- |
| [docker/install-docker.sh](./docker/install-docker.sh) | Full install for Docker VPS |
| [docker/docker-compose.yml](./docker/docker-compose.yml) | postgres + backend + frontend |
| [docker/Dockerfile](./docker/Dockerfile) | App images |
| [docker/nginx-jumpifzero.conf](./docker/nginx-jumpifzero.conf) | Host-based vhost for existing nginx |

Legacy host-nginx/systemd scripts under `scripts/` and `install.sh` are only for VPS boxes **without** Docker owning 80/443. This Hostinger box should use **docker/install-docker.sh** only.
