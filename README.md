# portfolio-web

The Next.js frontend for my personal site: portfolio/CV, travel journal, career story and blog, plus a password-protected admin panel with a markdown editor. Content comes from [`portfolio-api`](../portfolio-api) (Go + Postgres).

**Stack:** Next.js 16 (App Router, ISR) · React 19 · Tailwind CSS v4 · Framer Motion · Three.js (React Three Fiber) · `react-markdown` · `@uiw/react-md-editor`

## Structure

```
src/
  app/
    (site)/            public site: /, /trips, /blog, /career (+ [slug] detail pages)
    admin/             admin panel (client-rendered, JWT in localStorage)
    api/revalidate/    server-to-server cache invalidation hook for the API
    sitemap.ts, robots.ts
  components/
    portfolio/         Hero, About, Experience, Projects, Education, Skills, Contact, BeyondCode
    effects/           Three.js scenes, particles, radar chart, glitch text, cursor trail
    content/           cards, markdown renderer, gallery/lightbox, article shell, pagination
    admin/             app shell + auth gate, editors, upload fields, CV editor, toasts
    layout/            navigation, footer, ambient effects
  lib/                 API clients (public + admin), auth session, formatting, site config
  types/               API response/request types
```

## Local development

Start the API first (see `portfolio-api/README.md`), then:

```bash
cp .env.example .env.local
```

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000, and http://localhost:3000/admin for the admin panel.

## How content stays fresh

- Public pages are cached with ISR (`revalidate = 60`). If the API is briefly down, visitors keep getting the last good page.
- After each admin save, the API calls `POST /api/revalidate` with a shared secret and the affected cache tags (`posts`, `post:<slug>`, …), so edits appear immediately.
- `next build` succeeds without the API (pages render empty and fill in on first revalidation).

## Security

- Strict security headers: CSP (no third-party scripts, `object-src 'none'`, `frame-ancestors 'none'`), HSTS, nosniff, Referrer-Policy, Permissions-Policy.
- Markdown is rendered without raw HTML, and `javascript:` URLs are dropped. The editor preview uses the same renderer.
- Admin pages are `noindex`, `no-store`, disallowed in `robots.txt`, and rendered client-only. The API enforces auth on every admin request; the client gate is UX only.
- The admin token is cleared on expiry, on any 401, and on sign-out. Rotating the admin password on the API revokes all tokens.
- `/api/revalidate` requires a ≥32-byte secret (constant-time compare) and only accepts known tag shapes.

## Deploying to Vercel

1. Import the repository in Vercel (framework: Next.js; defaults are fine).
2. Set environment variables (Production and Preview):

| Variable | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://maulanaiskak-api.fly.dev` | Public API URL |
| `NEXT_PUBLIC_IMAGE_ORIGINS` | `https://images.yourdomain.com` | R2 public origin(s), comma-separated |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | Canonical URL for sitemap/OG |
| `REVALIDATE_SECRET` | *(same as API)* | Server-only |
| `NEXT_PUBLIC_FORMSPREE_ID` | `xyzabcd` | Optional; enables the contact form |

3. Add your domain, then make sure the API's `CORS_ORIGIN` lists it exactly (e.g. `https://yourdomain.com`). Preview deployments can browse public pages; admin login only works from origins in `CORS_ORIGIN`.
