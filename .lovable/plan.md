# Final Plan — Site-wide SEO / i18n / Assets / Cleanup + Internal-route Exclusion

Click **Implement plan** to switch me to build mode; I execute in one pass.

## Prerender → option (d), accepted
Helmet per route + strong sitewide fallback tags in `index.html`. Trade-off you accepted: **social shares of subpages will show the homepage-level preview** (LinkedIn/Slack/Facebook/X don't execute JS, so they only see the static head). Googlebot sees the per-route Helmet tags fine. TanStack migration and puppeteer-based prerender both rejected — they'd break routing/i18n or add build-time fragility.

## 1. Language & RTL
`index.html` → `<html lang="fa" dir="rtl">`. `LanguageContext`: priority `?lang=` → `localStorage("lang")` → `/en` path → `fa`, persist on change, strip `?lang=` after applying.

## 2. Per-page SEO (`react-helmet-async` already installed)
New `src/components/SEO.tsx` — `title`, `description`, canonical, hreflang (fa/en/x-default), og:*, twitter:*, `og:locale=fa_IR` + alt `en_US`, optional `robots`, optional JSON-LD. Add to `/`, `/about`, `/services`, `/case-studies`, `/ai-philosophy`, `/blog` (noindex), `/contact`, `NotFound` (noindex). Homepage carries Organization JSON-LD. Strip duplicated `<title>`/`<meta description>`/`og:title`/`og:description` from `index.html`.

## 3. Sitemap + robots (see also #11)
`public/sitemap.xml` — 10 entries (Blog excluded). Append `Sitemap:` directive to `robots.txt`.

## 4. Contact info
`Footer.tsx`: visible contact block above social row — `Contact@AdrianIdea.ir` (mailto), `+98 912 563 3479` (tel:), `www.AdrianIdea.ir`. `ContactPage.tsx` already correct.

## 5. Self-host brand assets
`public/favicon.png` (already downloaded into sandbox). `index.html` gets one local set — remove `storage.googleapis.com/...` AND all `/lovable-uploads/38598e63-...png` favicon/tile refs. `public/og.png` copied from your upload. All SEO tags → `https://adrianidea.ir/og.png`.

## 6. Self-host Sahel font
5 weights (300/400/600/700/900) already downloaded to `public/fonts/sahel/`. `@font-face` at top of `src/index.css`, `font-display: swap`. Remove `<link href="https://cdn.fontcdn.ir/...">` from `index.html`.

## 7. Login / Sign in
No `/login` route exists — nothing to remove there. Remove `Sign in → /auth` button from `Index.tsx` (desktop + mobile menu) and from `HomeNav` in `shared.tsx`. Keep `/auth` route and `Navigation.tsx` Sign In (internal-only, used by dashboard/HR/finance flows).

## 8. Blog
Hide Blog from `HomeNav` (`shared.tsx`), `Index.tsx` desktop + mobile menu, `HomeFooter` (`shared.tsx`), `Footer.tsx`. `BlogPage.tsx`: empty state → "coming soon" + contact CTA. `<SEO robots="noindex, follow">` on `/blog`.

## 9. 404
`NotFound.tsx` — `<SEO robots="noindex, follow">`, expand links to `/`, `/services`, `/contact`.

## 10. Cleanup (scope-limited per your acceptance)
Remove `console.log` from marketing/boot code only: `src/main.tsx`, `src/hooks/usePushNotifications.ts` (leave `[SW]` logs in `sw.ts`). **Do not touch** HR/finance/letter/CRM internal components. `index.html` `<noscript>` block in `<body>` with company name, Persian + English one-liners, email + phone.

## 11. Internal-route exclusion (new)
- **`public/robots.txt`** — append `Disallow:` for every internal prefix in `App.tsx`:
  `/auth`, `/dashboard`, `/writing-letter`, `/financial-analysis`, `/projects`, `/hr-management`, `/create-document`, `/create-request`, `/our-life`, `/our-financial`, `/our-calendar`, `/our-todo`, `/install`, `/reset-password`, `/email`, `/customers`, `/subscriptions`. Sitewide fallback `Sitemap:` line follows.
- **In-page `<SEO robots="noindex, nofollow">`** on the three internal pages most likely to be directly linked/crawled: `AuthPage.tsx`, `DashboardPage.tsx`, `ResetPasswordPage.tsx`. The other 15+ internal pages are covered by robots.txt only — adding Helmet + SEO to every one is out of scope for this pass; called out below in "will be skipped".

## Files touched
- **New**: `src/components/SEO.tsx`, `public/sitemap.xml`, `public/favicon.png`, `public/og.png`, `public/fonts/sahel/*.woff2` × 5.
- **Edited**: `index.html`, `src/index.css`, `src/contexts/LanguageContext.tsx`, `src/main.tsx`, `src/components/home/shared.tsx`, `src/components/Footer.tsx`, `src/pages/Index.tsx`, `AboutPage.tsx`, `ServicesPage.tsx`, `CaseStudiesPage.tsx`, `AIPhilosophyPage.tsx`, `BlogPage.tsx`, `ContactPage.tsx`, `NotFound.tsx`, `AuthPage.tsx`, `DashboardPage.tsx`, `ResetPasswordPage.tsx`, `public/robots.txt`, `src/hooks/usePushNotifications.ts`.

## Will be skipped / altered (heads-up before you approve)
1. **Per-route `noindex` on ~15 other internal pages** (HRManagement, Projects, Customers, Email, OurLife/Financial/Calendar/Todo, WritingLetter, etc.) — covered by `robots.txt` `Disallow` only.
2. **`console.log` in internal admin/HR/finance components** (~40 lines across LetterBuilder, HR, financial uploads, CreateRequestPage, NewDocumentDialog) — explicitly out of scope per your acceptance.
3. **Prerendered per-route social previews** — accepted trade-off; subpage social previews will use the homepage-level fallback.

Approve to execute.
