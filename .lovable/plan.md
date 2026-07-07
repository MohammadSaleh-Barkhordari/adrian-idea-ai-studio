# 1:1 Port of Remaining Marketing Pages

Rebuild `AboutPage`, `ServicesPage`, `CaseStudiesPage`, `AIPhilosophyPage`, `ContactPage` as faithful ports of the uploaded HTML files, and restyle `BlogPage` to match `blog.html` while keeping its live DB fetch. All pages share the same warm-black + gold system already scoped under `.home-root` for the homepage.

## Approach

1. **Extract shared shell from `Index.tsx`** into reusable pieces so every marketing page renders identically to the homepage chrome:
   - `src/components/home/HomeShell.tsx` — wraps children in `.home-root`, mounts `Preloader`, `CursorLayer`, scroll-progress bar, and runs `useHomeEffects`.
   - `src/components/home/HomeNav.tsx` — top nav + mobile menu + language switcher hook (LanguageContext), active-link highlight per route.
   - `src/components/home/HomeFooter.tsx` — footer block from `index.html`.
   - Move `useHomeEffects`, `LogoMark`, `Preloader`, `CursorLayer`, `Counter`/`useCountUp`, `MagneticButton`, `Tilt`, `MaskReveal`, `FadeUp` into `src/components/home/primitives.tsx`.
   - Refactor `Index.tsx` to consume `HomeShell` + `HomeNav` + `HomeFooter` (no visual change; verified via screenshot).

2. **Translations**: extend `src/translations/home.ts` with a namespace per page:
   ```
   home.about, home.services, home.caseStudies, home.aiPhilosophy, home.contact, home.blog
   ```
   Copy every `data-i18n` string from each uploaded HTML (both English default and Farsi translations already inline in each file's `<script>fa = {...}</script>` block). Emphasis tokens (`{gold}`, `{serif}`) reused from homepage.

3. **New page files** (replace current bodies wholesale):

   | Page | Sections ported from HTML |
   |---|---|
   | `AboutPage.tsx` | hero, stats counters, story, principles grid, timeline, team, CTA |
   | `ServicesPage.tsx` | hero, 6 service bento cards, methodology strip, pricing tiers band, CTA |
   | `CaseStudiesPage.tsx` | hero, 7 case-study feature blocks (Robi, Insta Intelligence, Contract Organizer, healthcare, renovation, supply chain, EV), metrics band, CTA |
   | `AIPhilosophyPage.tsx` | hero, 5 pillars grid, security/compliance strip, audit transparency block, CTA |
   | `ContactPage.tsx` | hero, contact info panel, **existing `<Contact />` form kept**, methods list, CTA |
   | `BlogPage.tsx` | hero + filter strip styled per `blog.html`, but posts rendered from existing Supabase query (map DB post → card markup from HTML). Empty/loading states retained. |

4. **Contact form**: keep the existing `Contact` component's submit handler untouched. Only its wrapping layout, headings, and surrounding info blocks come from `contact.html`. Restyle the inner form fields with `.home-root` classes so they inherit the warm-black theme.

5. **Blog restyle**: `BlogPage` keeps its `useEffect` fetching from `blog_posts`, category filters, pagination, and language filter. Cards, hero, filter bar, and empty state get the visual treatment from `blog.html` (grid layout, gold accent, serif italic headings). No schema changes.

6. **Routing**: no changes to `App.tsx` routes; only the page components' internals change.

7. **Global CSS**: no changes to `src/index.css`. All styling continues to live in `src/styles/home.css` under the `.home-root` scope. Extend `home.css` only with any page-specific classes not already present (e.g., case-study grid, pricing tiers, timeline dots) — added inside `.home-root` selectors.

## Technical Details

- Preloader stays mounted once per SPA session using `sessionStorage` flag, so navigating About → Services doesn't replay it every route change (matches HTML behavior where each page shows it, but SPA feels smoother; single flag = one show per session).
- `HomeNav` reads `useLocation()` to mark the active link (`/about`, `/services`, …) with the gold underline.
- Language: `LanguageContext` already exposes `language`/`setLanguage`. `HomeNav`'s EN/FA toggle calls `setLanguage(...)`, and translated strings come from `t.home.<page>.*`.
- Farsi strings for each page: taken verbatim from the `<script>` FA dictionary embedded at the bottom of every uploaded HTML file.
- `MouseTrail` component (currently used by all these pages) is removed from these pages — replaced by home's `CursorLayer`.
- No new deps.

## Files touched

**New**
- `src/components/home/HomeShell.tsx`
- `src/components/home/HomeNav.tsx`
- `src/components/home/HomeFooter.tsx`
- `src/components/home/primitives.tsx`

**Rewritten**
- `src/pages/AboutPage.tsx`
- `src/pages/ServicesPage.tsx`
- `src/pages/CaseStudiesPage.tsx`
- `src/pages/AIPhilosophyPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/BlogPage.tsx` (layout only; data logic preserved)
- `src/pages/Index.tsx` (refactor to use shared shell — zero visual diff)

**Extended**
- `src/translations/home.ts` (add per-page namespaces, EN + FA)
- `src/styles/home.css` (add page-specific section classes)

## Out of scope

- Blog post detail page (`BlogPostPage`) — not in the uploads.
- Legal pages (privacy/terms/cookie/data-processing).
- Authenticated app routes.
- No backend, translation-key, or route changes.

## Verification

- Playwright screenshots at 1280×1800 and 390×844 for `/`, `/about`, `/services`, `/case-studies`, `/ai-philosophy`, `/contact`, `/blog` in both `en` and `fa`.
- Confirm contact form still submits (network tab).
- Confirm blog cards render from DB.
- Confirm `/dashboard` and other authenticated routes are visually unchanged.
