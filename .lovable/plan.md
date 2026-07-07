## Phase 2 — Auth, Reset Password, Install App restyle

Bring the three remaining public/utility pages into the same `HomeShell` + `PageHero` + `.ai-form` visual language used across Phase 1 (Contact, legal, BlogPost, NotFound). No business-logic changes — only chrome, layout, and inputs are touched.

### 1. `src/pages/AuthPage.tsx`
- Drop `Navigation`, `Footer`, `Card*`, `Tabs*`, `Button`, `Input`, `Label`, `Mail`, `Lock`, `ArrowLeft` imports.
- Wrap the page in `<HomeShell>`; add a compact `<PageHero>` (title "Welcome", subtitle "Sign in or create an account").
- Replace shadcn `Card` + shadcn `Tabs` with a slim custom tab switcher inside a `.wrap` container:
  - Two pill buttons ("Sign in" / "Sign up") styled with existing `.btn btn-line` / `.btn btn-fill` classes; active state = `btn-fill` gold.
  - Forgot-password view stays as a third internal state (toggled by "Forgot password?" link under Sign in).
- Rebuild all form fields with the shared `<Field>` component (`label`, `type`, `value`, `onChange`, `placeholder`). Remove icon-in-input decoration.
- Submit buttons become `<button class="btn btn-fill magnetic">` with existing `handleSignIn` / `handleSignUp` / `handleForgotPassword` calls untouched.
- "Back to Home" becomes a small `.btn btn-line` above the form linking to `langPrefix || '/'`.
- Keep all existing state, effects, toasts, and Supabase auth calls verbatim.

### 2. `src/pages/ResetPasswordPage.tsx`
- Same treatment: drop `Navigation`/`Footer`/`Card*`/shadcn `Input`/`Label`/`Lock` and wrap in `<HomeShell>` with `<PageHero title="Reset password" subtitle=… />`.
- Render the two password inputs with `<Field>`; submit uses `.btn btn-fill magnetic`.
- Preserve `PASSWORD_RECOVERY` listener, `canReset` gating message, validation, and `updateUser` call as-is.

### 3. `src/pages/InstallAppPage.tsx`
- Keep the `<Helmet>` block. Replace outer fragment + `Navigation`/`Footer` with `<HomeShell>`.
- Replace the top intro block with `<PageHero title="Install Adrian Idea" subtitle=…>`.
- Rebuild the two feature cards inside a `.wrap` grid using existing `.ai-card` / `.tile` classes already used on the home surfaces (or add a small local `.install-card` class in `home.css` if none fits) — bordered dark card, gold icon, gold `.btn btn-fill magnetic` CTA.
- iOS instructions block stays as an ordered list styled with muted text; use gold `Share2` icon color via `color: var(--gold)` inline.
- Bottom "App Features" strip becomes a simple 3-column grid inside a `.wrap` with the same tile styling — no shadcn primitives.
- All install / notification handlers (`handleInstallClick`, `subscribe`, `beforeinstallprompt` listeners, `usePushNotifications`) remain unchanged.

### 4. `src/styles/home.css` (only if needed)
- Add a small `.auth-tabs` rule set (flex row, gap 8px, centered, max-width 420px) if the shared `.btn` classes need spacing tweaks.
- Add `.install-grid` and `.install-card` helpers only if existing tokens don't already cover the layout; otherwise reuse `.ai-form` / `.tile` patterns.

### Out of scope
- No changes to `Navigation`, `Footer`, translations, routes, Supabase config, or push-notification logic.
- No changes to Farsi mirrors — these three routes are language-agnostic in the current app.

### Verification
- `tsgo --noEmit`.
- Playwright at 1280×1800 to capture `/auth`, `/reset-password` (unauth state message), `/install-app` desktop + emulated iOS UA; review screenshots for HomeShell nav, hero, gold accents, no shadcn cards, footer intact.
