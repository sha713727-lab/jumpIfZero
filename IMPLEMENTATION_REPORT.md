# IMPLEMENTATION REPORT (in progress)

## E. Residual risk register

| Risk | Status | Detail |
|---|---|---|
| Client-only sessions | **CLOSED (Batch 3.5)** | Replaced `sessionStorage` with signed `__Host-jz_session` httpOnly cookies (`src/lib/session.ts`). `requireSession` in protected layouts + `submitSignOut`. Login actions mint cookies server-side. |
| Seed data in client chunks | **OPEN (Batch 3.5 residual)** | Server-gating routes does **not** remove `adminDemo.ts` (and related) from `/_next/static/chunks/*`, which are served without auth. Tax IDs, employee emails, and client records remain publicly fetchable from JS bundles. |
| Login rate limiting | **OPEN (Batch 3.5 residual)** | Login Server Actions have no rate limiting (§11 needs a DB-backed bucket; no DB in scope). Unbounded password guessing remains possible. |
| No session revocation | **OPEN (Batch 3.5 residual)** | A leaked cookie is valid until `exp`. Chose **`SESSION_MAX_AGE_SECONDS = 8h`** (28800s), the maximum allowed by the amendment. |
| Finding 14 CSP `unsafe-inline` scripts | **Downgraded to P2** | Leave `script-src` alone; no `proxy.ts`/nonces. Apply only: `object-src 'none'`, strengthen existing `base-uri`/`frame-ancestors`/`form-action`, plus HSTS (#34). Keep `style-src 'unsafe-inline'` for GSAP/framer. |
| Fake Google sign-in (customer) | **CLOSED (#49)** | Removed |
| Fake Google sign-in (employee) | **CLOSED (#50)** | Removed |
| Fake Google / register path | **CLOSED (#51 + #52)** | Google removed (#51); entire `/register` route deleted (#52) |
| No backend / CMS / i18n / tests | **OPEN** | Still out of scope per master prompt §2 |
| `npm audit` high via next→postcss/sharp | **OPEN** | Do not `audit fix --force` |
| Seed data as product data | **OPEN** | `src/constants/` seed remains except line-level Batch fixes |

## F. Decisions needed / answered

| Item | Answer |
|---|---|
| 6.1 CSP | Leave script-src; no proxy; apply object-src/HSTS/etc. as specified |
| 6.2 Contact | (b) mailto + tel |
| 6.3 Contact details | email `ikram@jumpifzero.com`, phone `03079222055`, delete “50 states”, keep Lahore |
| 3.5 cookies | Implemented with amendments 1–4 |

## New findings filed

| ID | Severity | Location | Issue | Status |
|---|---|---|---|---|
| **49** | P0 | customer Google fake | Fake Google grants customer session | **fixed** |
| **50** | P0 | employee Google fake | Fake Google grants employee session | **fixed** |
| **51** | P0 | register Google fake | Fake Google on register | **fixed** |
| **52** | P0 | `/register` + `submitRegister` | Password collected; no user store; signed in as demo customer | **fixed by deletion** |

## Batch notes

### #52 — register removal
- Deleted route, `RegisterPageClient`, `submitRegister`, `validateRegister`, `constants/register`, login register link/copy.
- Batch 3 lint item `submitRegister.ts:8 unused _values`: **resolved by deletion**, not by a code fix.
- `loginCopy.credentialsError` (“Use the demo customer email and password.”) is **not** orphaned after #42: still rendered on failed customer login in `LoginPageClient`.

### Batch 3.5 — cookie sessions
- `SESSION_SECRET` (≥32) in `env.ts` + `.env.example`
- Cookie: `__Host-jz_session`, httpOnly, Secure, SameSite=Lax, Path=/, maxAge=8h
- HMAC-SHA256 over base64url(JSON); `timingSafeEqual`; payload `{ role, subjectId, iat, exp }`
- Server Actions inventory:
  - `submitAdminLogin` / `submitLogin` / `submitEmployeeLogin` — create session (no `requireSession`; unauthenticated entry)
  - `submitSignOut` — `requireSession(role)` then clear cookie
- Deleted: `adminSession.ts`, `demoSession.ts`, `employeeSession.ts`
