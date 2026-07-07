## Goal

Visually verify that every Phase 1 page renders in the new warm-black + gold `HomeShell` design with no leftover old chrome or unstyled Tailwind blocks.

## Steps

1. **Capture screenshots** with Playwright at 1280×1800 (headless Chromium against `http://localhost:8080`) for:
   - `/contact` and `/en/contact` — hero, info cards, new inline form (labels, gold submit button)
   - `/privacy-policy`, `/terms-of-service`, `/cookie-policy`, `/data-processing`
   - Farsi mirrors: `/fa/privacy-policy`, `/fa/terms-of-service`, `/fa/cookie-policy`, `/fa/data-processing`
   - `/blog/<first-published-slug>` (resolve by hitting `/blog` first and clicking the first card) — verify HomeShell nav, no old `Navigation`/`Footer`
   - `/nonexistent-route-xyz` → NotFound page
   Screenshots land under `/tmp/browser/phase1/screenshots/`.

2. **View each screenshot** with `code--view` and check:
   - HomeShell nav (dark bg, gold logo, EN/FA toggle, Start-project pill) is at the top
   - HomeFooter (ADRIAN IDEA giant wordmark + 4-col grid) is at the bottom
   - No purple/blue gradients, no shadcn `bg-primary` teal buttons, no old `<Navigation />` marketing bar
   - Legal pages: title + prose readable on dark background, gold link accents, `.legal-doc` spacing
   - Contact form: labeled fields with gold focus, gold "Send message" pill
   - BlogPost: hero title, article prose, related-post cards, "Contact Us" CTA all sit inside HomeShell
   - NotFound: centered layout with serif "not found" and gold "Return home"

3. **Report findings** back: list what's clean, flag anything that still looks broken (contrast, overflow, RTL alignment, stray old styling). If any page needs a fix, propose the follow-up in a new plan; don't edit yet.

## Not in this plan

- No file edits. This is a read-only visual audit. Any fixes get their own plan afterward.
- Phase 2 (Auth/Reset/Install) is untouched.
