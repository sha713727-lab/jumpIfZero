# Dev seeds

Synthetic data for local development only. Never apply in production.

## 001_identity.sql

| Email | Role | Kind | Password |
|---|---|---|---|
| `admin@jumpifzero.example` | admin | — | `DevAdminPass1!` |
| `delivery@jumpifzero.example` | employee | delivery | `DevDeliveryPass1!` |
| `sales@jumpifzero.example` | employee | sales | `DevSalesPass1!` |
| `client@jumpifzero.example` | client | — | `DevClientPass1!` |

## 002_operations.sql

Requires `001_identity.sql`. Creates:

- Client profile for `client@jumpifzero.example`
- Assignment to delivery employee
- Sample project (needs at least one active service)
- Sample invoice `INV-DEV-1001`
- Sample welcome message

No binary files.

## 003_crm.sql

Requires `001_identity.sql`. Creates:

- Second sales employee `sales2@jumpifzero.example` / `DevSalesPass1!`
- Sample insurance + factoring parties
- Sample lead for primary sales rep
- Sample sales-to-sales message

```bash
psql -U jz_owner -h 127.0.0.1 -p 5433 -d jumpifzero -f database/seeds/dev/001_identity.sql
psql -U jz_owner -h 127.0.0.1 -p 5433 -d jumpifzero -f database/seeds/dev/002_operations.sql
psql -U jz_owner -h 127.0.0.1 -p 5433 -d jumpifzero -f database/seeds/dev/003_crm.sql
```
