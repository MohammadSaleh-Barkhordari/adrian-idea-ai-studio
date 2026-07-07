
## Goal
Make `src/pages/Index.tsx` match the uploaded `index-2.html` 1:1 in structure, labels, and links — while keeping the existing shader/effects/i18n plumbing intact.

## Diffs I found vs. the HTML

**Nav / brand**
- Nav brand `href` currently `#` → should point to `/` (home).
- Desktop nav links point to on-page anchors (Capabilities, Product, Process, Voices). HTML links to the sibling pages (About, Services, Case Studies, Philosophy, Blog). Since those pages now exist as React routes, use `/about`, `/services`, `/case-studies`, `/ai-philosophy`, `/blog`.
- Hero "Book a strategy call" and CTA email/phone section: hero button should link to `/contact` (HTML links to contact.html). "See it work" stays `#agent-console`.
- Approval button inside console → `/contact`.

**Mobile menu**
- HTML lists 7 items: Home, About, Services, Case Studies, Philosophy, Blog, Contact (numbered 01–07). Current list has 5 anchors. Replace with the 7-item page-route version.

**Logo (both nav + footer + orbit-core + preloader)**
- HTML paths (exact):
  - `M50.6 4.9 60.7 28.1 48.3 48.2 37.9 27.7Z`
  - `M49.3 49.3 59.6 29.6 95.7 99Q96.6 100.7 94.2 100.7L63.8 100.7Q68.2 98.1 67.7 90.9Z`
  - `M20.8 71.5 5.2 100.7 27.5 100.7Q30 99.8 28.8 97.7Q23.5 85.5 20.8 71.5Z`
- Gold gradient: 4 stops — `#f6d67f 0`, `#e2ae4a .45`, `#c08c2e .78`, `#7a5518 1`.
- Update `LogoMark` and the inlined preloader SVG to use these exact paths + gradient.

**Capabilities cell E**
- Shield percentage badge shows `100%` in HTML (currently `SOC2`). Restore `100%`.

**Voices section**
- After the quote-nav dots, HTML has a centered CTA: `All case studies ↗` linking to `/case-studies`. Add it (with translation key `voices.all`).

**Footer**
- Wordmark sub should always be `آدرین ایده کوشا` (matches HTML footer), not the translated hero sub. Hardcode.
- Studio column: 5 items (About, Services, Case Studies, Philosophy, Blog) linking to their routes — currently 4 in-page anchors.
- Legal column: 4 items (Privacy Policy, Terms of Service, Cookie Policy, Data Processing). Currently 3.

**Marquee**
- HTML explicitly alternates 6 labels with `ghost` class per position (`Custom AI Platforms`, `Business Analysis` ghost, `Autonomous Agents`, `Predictive Analytics` ghost, `Computer Vision`, `24/7 Support` ghost) and repeats the block twice. Current React repeats `t.marquee` 4× and toggles `ghost` by index parity — that mismatches which items are ghost. Fix by mapping each source item to its `ghost` flag from the HTML pattern and repeating the sequence twice.

**Translations (`src/translations/home.ts`)**
- Add `nav.about`, `nav.services`, `nav.cases`, `nav.philosophy`, `nav.blog`, `nav.home` (mobile menu labels + desktop nav labels), matching FA_DICT strings from the HTML.
- Add `voices.all` = "All case studies ↗" / "همه‌ی نمونه‌کارها ↗".
- Add `footer.studio` array of 5 (About/Services/Case Studies/Philosophy/Blog) and `footer.legal` array of 4.
- Add `footer.wordmarkSubFixed` = `آدرین ایده کوشا` (constant across locales) — or just hardcode in JSX.

## Files to touch

1. `src/pages/Index.tsx` — nav links, brand href, mobile menu, LogoMark paths + gradient, Preloader SVG paths, shield text, hero/console CTA hrefs, marquee mapping, voices "All case studies" link, footer studio/legal lists, footer wordmark sub.
2. `src/translations/home.ts` — add the new nav labels, `voices.all`, footer arrays.

No CSS changes required — all class names already exist in `home.css`.

## Verification

- `tsgo` typecheck.
- Playwright: load `/` at 1280×1800 and `/?lang=fa`, screenshot hero + capabilities + footer; confirm nav labels, mobile menu (open menu, screenshot), shield says `100%`, footer has 5 studio + 4 legal links, "All case studies" appears after voices, and page links navigate to the correct routes.
