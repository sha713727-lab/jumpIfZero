# JZ Enterprises — Jump If Zero

Official marketing site for **JZ Enterprises** — strategy, design, development, and growth systems under one brand.

Live product stack: **Next.js 16**, **React 19**, **Tailwind CSS 4**, **GSAP**.

Repository: [sha713727-lab/jumpIfZero](https://github.com/sha713727-lab/jumpIfZero)

---

## Project structure

```text
jumpIfZero/
└── frontend/          ← Next.js app (set this as Vercel Root Directory)
    ├── public/        ← images, logos, scroll frames
    ├── scripts/       ← image optimize helpers
    ├── src/
    │   ├── app/       ← App Router pages
    │   ├── components/
    │   ├── constants/
    │   ├── hooks/
    │   ├── lib/
    │   └── styles/
    ├── .env.example
    ├── next.config.ts
    └── package.json
```

---

## Requirements

- Node.js **20+** (recommended for Next.js 16)
- npm **10+**

---

## Local setup

```bash
git clone https://github.com/sha713727-lab/jumpIfZero.git
cd jumpIfZero/frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Absolute site URL (no trailing slash). Local: `http://localhost:3000`. Production: your custom domain. On Vercel builds, if unset, the app falls back to `https://$VERCEL_URL`. |

Copy from `.env.example`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build (runs image optimize prebuild) |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

---

## Homepage sections

1. Scroll frame hero  
2. Brand scroll story  
3. Services carousel  
4. Why Us deck  
5. About / floating gallery  
6. Marquee  
7. Testimonials  
8. Team  
9. FAQ  
10. Closing CTA + site footer  

---

## Deploy on Vercel

The app lives in **`frontend/`**. On Vercel you must set **Root Directory** to `frontend`.

### 1. Import the repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **`sha713727-lab/jumpIfZero`**
3. Configure the project:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js (auto) |
| Root Directory | `frontend` |
| Build Command | `npm run build` (default) |
| Output Directory | leave default (Next.js) |
| Install Command | `npm install` (default) |

### 2. Add environment variables

In **Project → Settings → Environment Variables**, add for Production (and Preview if you want):

```text
NEXT_PUBLIC_SITE_URL=https://YOUR_PROJECT.vercel.app
```

After you attach a custom domain, update this to that domain (for example `https://jumpifzero.com`) and redeploy.

### 3. Deploy

Click **Deploy**. First production build may take longer because of assets and the image optimize prebuild.

### 4. Custom domain (optional)

1. Vercel → Project → **Settings → Domains**
2. Add your domain and follow DNS instructions
3. Update `NEXT_PUBLIC_SITE_URL` to the final HTTPS URL
4. Redeploy

### 5. CLI alternative

```bash
npm i -g vercel
cd jumpIfZero/frontend
vercel
```

Link the project, set Root Directory to `frontend` in the dashboard if prompted via monorepo import, and add `NEXT_PUBLIC_SITE_URL` before promoting to production:

```bash
vercel --prod
```

---

## Production notes

- Do not commit `.env.local` or secrets
- `NEXT_PUBLIC_SITE_URL` is validated at build/runtime — missing value fails the build on purpose
- Hero scroll uses many frame images under `public/images/JZ_Frames_30FPS/` — keep them in the repo for correct production behavior
- Security headers (CSP, frame deny, etc.) are configured in `next.config.ts`

---

## License

Private project for JZ Enterprises. All rights reserved.
