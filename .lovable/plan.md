
# 1:1 Faithful Port of `index2.html` to the Homepage

Apply the uploaded `index2.html` design (warm-black + gold, Syne/Instrument Serif/Inter/Vazirmatn, shader hero, mask-reveal type, custom cursor, agent-console replay, bento capabilities, kinetic bands, quote carousel) to the homepage `/` and `/en`. Keep it strictly scoped to the homepage — the app's dashboard, subscriptions, financial pages, etc. stay untouched. Wire all copy to the existing `LanguageContext` (`translations/en.ts`, `translations/fa.ts`).

## Scope guardrails

- Only `src/pages/Index.tsx` and its child components change. Global `src/index.css` and shared `Navigation`/`Footer` used across the app are NOT replaced globally; the homepage renders its own scoped nav + footer (matching index2.html) instead of the shared ones, so authenticated app routes are unaffected.
- No new backend, no route changes, no functionality changes.
- Existing pages that import `Navigation`/`Footer` keep working exactly as today.

## Fonts

Install via `@fontsource` (per platform rules):

- `@fontsource/syne` (600/700/800) — display
- `@fontsource/instrument-serif` (400 + italic) — accent serif
- `@fontsource/inter` — already implicitly used; add via fontsource for reliability (300/400/500/600)
- `@fontsource-variable/vazirmatn` — Farsi body/display

Imported in `src/main.tsx`. Registered in `tailwind.config.ts` under `fontFamily.display / serif / body / mono`.

## New homepage-scoped stylesheet

Create `src/styles/home.css`, imported only in the new homepage entry. It contains every custom rule from `index2.html`'s `<style>` block, rewritten as `.home-root [selector] { ... }` so nothing leaks out. Includes:

- Custom CSS variables (`--bg`, `--s0..s2`, `--ink*`, `--gold*`, `--line*`, motion tokens, shadows) scoped under `.home-root`.
- Preloader, cursor dot/ring, top scroll progress bar.
- Nav (scrolled state, mobile menu, lang toggle, brand mark).
- Hero: shader canvas layer, noise, fade, mask-reveal `h1` lines, hollow/serif variants, flip-word rotator, ticker stat row.
- Marquee band, kinetic parallax band.
- Capabilities bento grid (5 cells: agents viz canvas, orbit rings, bars, stack list, shield rings) + tilt hover.
- Agent-console replay panel with staggered message reveal + replay button.
- Process sticky/steps.
- Manifesto quiet section, giant text.
- Voices quote carousel with nav dots.
- Final CTA with orb glow.
- Footer with giant wordmark.
- Motion: `.fade-up`, `.mask-reveal`, `.tilt`, `.magnetic`, `.loaded`, all keyframes.
- Reduced-motion + accessibility rules from source.
- Persian-specific font swaps (`[lang="fa"] .home-root { ... Vazirmatn ... }`).

The current global `src/index.css` `* { font-size: inherit !important }` and heading `!important` rules would break the design. Fix: inside `.home-root { font-size: revert; }` and reset the heading `!important` cascade by scoping our display styles with matching specificity + `!important` where required. No changes to the global CSS block.

## Component architecture

Replace the body of `src/pages/Index.tsx` with a scoped tree that mirrors index2.html section-for-section. Each section becomes its own component in `src/components/home/`:

```text
src/pages/Index.tsx                       # wraps in .home-root, mounts Preloader + all sections
src/components/home/
  HomeProviders.tsx                       # loaded-class state, lang class sync, reduced-motion, scroll-progress
  Preloader.tsx                           # SVG stroke-draw, counts to 100, resolves onDone
  CursorLayer.tsx                         # cursor dot + ring, magnetic + data-cursor label handling
  ScrollProgress.tsx
  HomeNav.tsx                             # scoped nav (NOT shared Navigation); brand, links, lang toggle, mobile drawer
  Hero.tsx                                # meta badge, mask-reveal h1, flip words, sub, CTAs, ticker stats (count-up)
  ShaderCanvas.tsx                        # ports the WebGL fragment shader verbatim (gold circuit grid)
  Marquee.tsx
  Capabilities.tsx                        # bento grid + AgentsViz canvas + OrbitRings + Bars + StackList + ShieldRings
  AgentsViz.tsx                           # 2D canvas node/edge sim from source
  KineticBand.tsx                         # two parallax lines
  AgentConsole.tsx                        # scripted message reveal + IntersectionObserver replay
  Process.tsx                             # sticky heading + 4 steps
  Manifesto.tsx
  Voices.tsx                              # 3-slide quote carousel + dots + auto-advance
  FinalCTA.tsx                            # cta-orb, giant mask-reveal
  HomeFooter.tsx                          # scoped footer with giant wordmark
```

`HomeProviders` reads `useLanguage()` and sets `lang`/`dir` on `.home-root` (does not touch `<html>`, which the app already manages elsewhere).

## Ports for the tricky pieces

- **WebGL shader (`#shader-canvas`)** — copy the GLSL and JS setup from lines ~640-750 of index2.html into `ShaderCanvas.tsx` as a `useEffect` that creates a WebGL1 context, compiles the fragment/vertex shaders, and animates via `requestAnimationFrame`, pausing when the canvas leaves the viewport (source already uses `IntersectionObserver` — preserved). Cleanup on unmount.
- **AgentsViz canvas** — same pattern, 2D context.
- **Mask-reveal / fade-up** — a single `useReveal()` hook wraps `IntersectionObserver` and adds `.on` / `.visible` classes to elements marked with `data-reveal`.
- **Magnetic buttons + custom cursor** — one shared mousemove listener in `CursorLayer.tsx`; hover-scale magnet transforms handled by attaching listeners to `[data-magnetic]` elements. Both no-op when `(pointer: coarse)` or `prefers-reduced-motion`.
- **Count-up ticker & preloader %** — small `useCountUp(target, decimals)` hook triggered by `IntersectionObserver`.
- **Flip word rotator** — CSS `transform: translateY(-Ne m)` on an interval, exactly as source.
- **Quote carousel** — index state + 6s interval + dot buttons.
- **Agent console replay** — array of messages with `delay` values from source; `useEffect` toggles `.show` classes; replay button resets.

## LanguageContext wiring

Extend `src/translations/en.ts` and `src/translations/fa.ts` with a new `home` namespace containing every string that has a `data-i18n` attribute in index2.html:

```text
home: {
  nav: { capabilities, product, process, voices, contact, menuBtn, menuClose },
  hero: { badge, metaLabel, h1Line1, h1Line2, h1Line3Prefix, flipWords[], sub, subGoldFragment, cta1, cta2,
          tick1..4, tickUnits },
  marquee: [ ... ],
  capabilities: { index, titlePre, titleSerif, cA{tag,h,p}, cB{...}, cC{...}, cD{...}, cE{...}, orbitChips[] },
  console: { index, titlePre, titleSerif, p, points[], bar, status, msg1..6, replay },
  kinetic: { line1, line2 },
  process: { index, titlePre, titleSerif, p, steps[{meta,h,p}]x4 },
  manifesto: { label, quote, sign },
  voices: { index, titlePre, titleSerif, quotes[{text,mark,name,role,initials}]x3 },
  cta: { titlePre, titleMid, titleSerif, p, emailCta, phoneCta },
  footer: { ... }
}
```

Farsi keys mirror the `fa: { ... }` block from index2.html's `i18n.fa` (lines ~300-400 of the source) verbatim. Components read from `t.home.*`. Where source contains inline HTML (`<mark>`, `<span class="serif">`, `<span class="gold">`), the translation stores the plain text and the component renders the emphasized fragment via a `{gold}` / `{serif}` / `{mark}` split token (documented in a comment above each key).

## App wiring

- `src/App.tsx` — no route changes. `/` and `/en` continue to render `<Index />`, which now renders the new tree instead of the old `Navigation/Hero/WhyChooseUs/Methodology/BlogPreview/Footer`.
- SEO metadata in `index.html` head is left as-is (already app-specific).

## What is intentionally NOT ported

Everything from index2.html that isn't visual homepage styling: its inline analytics stub, its own service-worker registration, the `<link rel="alternate">` block (project already has SEO). Interactive design behavior is preserved.

## Verification

After build, capture the homepage in the sandbox via Playwright at 1280x1800 and mobile 390x844; screenshot hero, capabilities bento, agent console, process sticky, voices, CTA; view each screenshot to confirm it matches index2.html. Toggle language via the scoped nav to confirm Farsi copy + RTL + Vazirmatn render correctly. Verify authenticated app routes (`/dashboard`, `/our-financial`) look unchanged.

## File summary

| File | Change |
|------|--------|
| `package.json` | Add @fontsource: syne, instrument-serif, inter; @fontsource-variable/vazirmatn |
| `src/main.tsx` | Import fontsource packages |
| `tailwind.config.ts` | Register `display`/`serif`/`body`/`mono` font families and warm-black+gold color tokens (scoped-only use) |
| `src/styles/home.css` (new) | Full port of index2.html `<style>` block, scoped under `.home-root` |
| `src/pages/Index.tsx` | Rewrite: `.home-root` wrapper + new section tree |
| `src/components/home/*` (14 new files) | Section + effect components listed above |
| `src/translations/en.ts` | Add `home` namespace |
| `src/translations/fa.ts` | Add `home` namespace (from index2.html `i18n.fa`) |
| Shared `Navigation.tsx`, `Footer.tsx`, `Hero.tsx`, `WhyChooseUs.tsx`, `Methodology.tsx`, `BlogPreview.tsx` | Untouched — still used by other pages |
| `src/index.css` | Untouched globally; homepage neutralizes conflicting `!important` inside `.home-root` |

Nothing outside the homepage changes visually or behaviorally.
