# Jump If Zero

JZ Enterprises platform monorepo: public marketing site, admin CMS, customer dashboard, employee portals, and a private HMAC-gated API.

## Repository layout

| Path | Description |
| --- | --- |
| `frontend/` | Next.js 16 application (public site and authenticated portals) |
| `backend/` | Node.js HTTP API (`node:http`) |
| `packages/contracts/` | Shared Zod contracts and environment schemas |
| `database/` | PostgreSQL 18 roles, migrations, and development seeds |

## Requirements

- Node.js 24+
- npm 10+
- PostgreSQL 18.x

## Local setup

```bash
git clone https://github.com/sha713727-lab/jumpIfZero.git
cd jumpIfZero
npm ci
```

### Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit both files with real local secrets. Do not commit `.env` or `.env.local`.

On Windows, set `FILE_STORAGE_ROOT` in `backend/.env` to a writable local path (for example `C:/Users/<you>/jz-files`).

HMAC values must match between `backend/.env` and `frontend/.env.local`.

### Database

Create the database and roles, then apply migrations and development seeds. See [`database/README.md`](./database/README.md) and [`database/DECISIONS.md`](./database/DECISIONS.md).

Development login accounts are listed in [`database/seeds/dev/README.md`](./database/seeds/dev/README.md).

### Run

Terminal 1 — API:

```bash
npm run start -w @jumpifzero/backend
```

Terminal 2 — web app:

```bash
npm run dev -w frontend
```

| Service | URL |
| --- | --- |
| Web app | http://localhost:3000 |
| API | http://127.0.0.1:3001 (HMAC required; unsigned calls return 401) |
| API docs (dev/test only) | http://127.0.0.1:3001/docs (`/openapi.json`) |

## Common scripts

| Command | Purpose |
| --- | --- |
| `npm run typecheck -w @jumpifzero/contracts` | Typecheck contracts |
| `npm run typecheck -w @jumpifzero/backend` | Typecheck backend |
| `npm run typecheck -w frontend` | Typecheck frontend |
| `npm run lint -w frontend` | Lint frontend |
| `npm run test:unit -w @jumpifzero/backend` | Backend unit tests |
| `npm run test:integration -w @jumpifzero/backend` | Backend integration and journey tests |
| `npm run test -w frontend` | Frontend unit tests |
| `npm run build -w frontend` | Production frontend build |
| `npm run cleanup:expired -w @jumpifzero/backend` | Remove expired sessions, nonces, and related rows |

## Deployment

### Shared VPS (second site beside an existing app)

See [`ops/vps/DEPLOY.md`](./ops/vps/DEPLOY.md): Cloudflare DNS → gate → `ops/vps/install.sh` (nginx + systemd on ports 3010/3011, isolated Postgres, no production use of `database/seeds/dev`).

### Other

- **Frontend:** deploy the `frontend/` directory (for example Vercel Root Directory `frontend`) with server env: `SESSION_SECRET`, `BACKEND_BASE_URL`, HMAC settings, and `NEXT_PUBLIC_SITE_URL`.
- **Backend:** run as a private long-lived Node process. Only the Next.js gateway should call it.
- Keep PostgreSQL, file storage, and secrets outside public networks.

## License

Private project for JZ Enterprises. All rights reserved.
