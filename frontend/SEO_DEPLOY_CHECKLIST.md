# SEO P0 — post-deploy checklist

Run after the Hostinger deploy that includes this SEO pass.

## Sitemap

1. Open `https://jumpifzero.com/sitemap.xml`.
2. Confirm there are **no** `#fragment` URLs (for example `/services#seo`).
3. Confirm listed URLs are canonical page paths only (`/about`, `/contact`, `/services/...`, `/blog/...`, `/portfolio/...`).

## Google Search Console (manual)

1. In the verified Search Console property for `jumpifzero.com`, submit:

   `https://jumpifzero.com/sitemap.xml`

2. Confirm Google reports the sitemap as processed, with submitted URL count and no hard errors.

## Redirects

Confirm permanent redirects (301):

- `https://jumpifzero.com/about-us` → `/about`
- `https://jumpifzero.com/about-us/` → `/about`
- `https://jumpifzero.com/about/` → `/about`
- `https://jumpifzero.com/contact/` → `/contact`

## Head tags (view-source)

On homepage, `/services`, `/about`, `/contact`, `/blog`, and one service pillar page, confirm:

- Unique `<title>` and meta description
- Canonical matches the preferred non-trailing-slash URL
- Open Graph title/description present
- JSON-LD includes Organization, WebSite, and LocalBusiness / ProfessionalService

## Images

Spot-check About studio flow and Portfolio marquee HTML for non-empty `alt` on content photos (logos may still use empty alt with `aria-hidden`).
