# Production bootstrap seeds

Safe starter content for a live JumpIfZero deploy. Idempotent.

| File | Contents |
| --- | --- |
| `001_cms.sql` | Services, portfolio, blog, FAQs, team |
| `002_site_sections.sql` | Gallery, testimonials, principles |

Does **not** include CRM freight PII or fake invoices/projects.

Users (admin / delivery / sales) are created by `ops/vps/docker/bootstrap-prod.sh` from `/root/jz-secrets.env`, not by these SQL files.
