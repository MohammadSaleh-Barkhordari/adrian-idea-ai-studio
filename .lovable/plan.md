Add a **Sign in** link right next to the existing **Start a project** CTA in the top navigation.

## Scope
- File: `src/components/home/shared.tsx` (`HomeNav`, ~line 338)
- File: `src/translations/home.ts` — add `nav.signIn: 'Sign in'` (EN) / `'ورود'` (FA)
- File: `src/styles/home.css` — no new class needed; reuse `.btn.btn-line.btn-sm.magnetic` so it visually pairs with the gold-filled CTA (outlined pill on the left, gold pill on the right)
- Mobile menu: append a matching "Sign in" entry after the Contact link

## Behavior
- Link target: `/auth`
- Order in `.nav-right`: `[lang toggle] [Sign in — outlined] [Start a project — gold] [menu button]`
- Existing `useEffect` in `AuthPage` already redirects logged-in users to `/dashboard`, so no auth-state gating is added in the nav (keeps it a simple entry link)

## Out of scope
- No visual redesign of the nav
- No changes to auth flow, footer, or other pages
