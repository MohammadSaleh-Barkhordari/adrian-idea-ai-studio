The homepage (`src/pages/Index.tsx`) has its own inline nav — separate from the shared `HomeNav` I edited last turn. That's why the Sign in button doesn't show on `/`.

## Fix

**`src/pages/Index.tsx`** (~line 541, desktop nav):
Insert a "Sign in" pill immediately before the gold "Start a project" CTA:
```tsx
<a href="/auth" className="btn btn-line btn-sm magnetic" data-cursor="go">
  <span>{t.nav.signIn}</span>
</a>
```
Final desktop order: `[EN/فا] [Sign in — outlined] [Start a project — gold] [menu]`.

**`src/pages/Index.tsx`** (~line 563, mobile menu):
Append a matching entry after the Contact link:
```tsx
<a href="/auth" onClick={() => setMenuOpen(false)}><span>{t.nav.signIn}</span><small>08</small></a>
```

## Out of scope
- No changes to `HomeNav` in `shared.tsx` (already done).
- No visual/CSS changes — reuses existing `.btn.btn-line.btn-sm.magnetic`.
- Translations already added (`t.nav.signIn`).