## Goal

Bring every remaining page under the new home-style design system (warm-black + gold, `HomeShell` chrome, PageShader, gold-bordered panels, serif accent titles). This is a large restyle — it will take multiple turns. This plan lays out the full scope, the phased execution order, and the shared primitives to build once so per-page work stays small.

## Phase 0 — Shared design primitives (do first, one turn)

Add reusable pieces to `src/components/home/shared.tsx` and `src/styles/home.css` so every page pulls from the same vocabulary:

- **`AppShell`** — variant of `HomeShell` that skips the preloader (internal pages shouldn't preload every navigation) and exposes an authenticated-user slot in the nav (avatar + sign-out) when a session exists.
- **`Panel`** — gold-bordered card wrapper (`.ai-panel`) replacing shadcn `<Card>` visually.
- **`SectionTitle`** — thin wrapper over existing `SecHead` for reuse.
- **`Field`** — labeled input/textarea/select using tokens, replaces raw shadcn `<Input>` styling on marketing-adjacent forms.
- **`DataTable` skin** — CSS-only overrides scoped under `.ai-table` so existing `<table>` markup inherits the new look (dark row bg, `--line` dividers, gold hover row, `--ink-dim` body).
- **`DialogSkin`** — CSS overrides for shadcn `DialogContent` inside `.home-root` so all existing dialogs read as warm-black + gold without touching every dialog file.
- **`ButtonSkin`** — CSS overrides for shadcn `<Button>` inside `.home-root` mapping default/secondary/outline/ghost to `.btn.btn-fill` / `.btn.btn-line` / etc.

These skins let internal pages keep their shadcn markup (tables, dialogs, tabs, dropdowns) while inheriting the new look through the `.home-root` scope — this is what makes "full restyle" feasible without rewriting every complex flow.

## Phase 1 — Public / marketing tail (one turn)

- **`src/pages/ContactPage.tsx`** — drop `<Contact />`, inline a new-design form (first/last name, email, company, project details). Reuse the existing `isSubmitting` + `useToast` submission behavior verbatim (no backend call today).
- **Legal pages** — wrap in `HomeShell` + `PageHero`, keep textual content, remove old `Navigation`/`Footer`:
  - `src/pages/PrivacyPolicyPage.tsx`
  - `src/pages/TermsOfServicePage.tsx`
  - `src/pages/CookiePolicyPage.tsx`
  - `src/pages/DataProcessingPage.tsx`
  - Farsi mirrors under `src/pages/fa/`
- **`src/pages/BlogPostPage.tsx`** — swap chrome to `HomeShell`; keep all data loading, comments, and rendering logic.
- **`src/pages/NotFound.tsx`** — restyle inside `HomeShell` with a large serif "404" and gold CTA back home.

## Phase 2 — Auth surface (one turn)

- **`src/pages/AuthPage.tsx`** — rebuild the shell in `HomeShell` (no preloader), keep all existing Supabase auth logic (sign-in, sign-up, Google OAuth, forgot-password). Form styled with `Field` primitives + gold `btn-fill` submit; social button uses `btn-line`.
- **`src/pages/ResetPasswordPage.tsx`** — same treatment: keep `type=recovery` detection + `supabase.auth.updateUser({password})` logic, restyle chrome and form.
- **`src/pages/InstallAppPage.tsx`** — restyle in `HomeShell`, keep install prompt logic and platform detection.

## Phase 3 — Internal app pages (three turns, grouped)

Every page in this phase gets: `Navigation`/`Footer` → `AppShell`, page background → `bg-background` via `.home-root`, headers → `SectionTitle`, cards → `Panel`, forms → `Field`, tables inherit `.ai-table` skin, dialogs inherit `DialogSkin`. Business logic, data fetching, RLS calls, and state stay unchanged.

**Turn A — Dashboards & lists**
- `src/pages/DashboardPage.tsx`
- `src/pages/ProjectsPage.tsx`
- `src/pages/ProjectDetailsPage.tsx`
- `src/pages/SubscriptionsPage.tsx`
- `src/pages/BlogDashboardPage.tsx`

**Turn B — CRM, HR, Email**
- `src/pages/CustomerManagementPage.tsx`
- `src/pages/CustomerDetailPage.tsx`
- `src/pages/HRManagementPage.tsx`
- `src/pages/EmailPage.tsx`

**Turn C — Content, financial, life**
- `src/pages/BlogEditorPage.tsx`
- `src/pages/WritingLetterPage.tsx`
- `src/pages/CreateDocumentPage.tsx`
- `src/pages/CreateRequestPage.tsx`
- `src/pages/FinancialAnalysisPage.tsx`
- `src/pages/OurLifePage.tsx`
- `src/pages/OurFinancialPage.tsx`
- `src/pages/OurCalendarPage.tsx`
- `src/pages/OurTodoPage.tsx`

## Explicitly out of scope

- Component internals of complex features (LetterBuilder canvas, GanttChart, MediaLibrary editors, EmployeeForm tabs, EmailCompose editor, VoiceRecorder, dialog children) — they inherit the skin, no logic changes.
- `src/components/Navigation.tsx`, `Footer.tsx`, `Hero.tsx`, and the other old marketing components — left in place, unused by the migrated routes.
- Supabase schemas, RLS policies, edge functions, translations for internal pages — untouched.

## Verification (per phase)

- `tsgo` typecheck.
- Playwright screenshots at 1280×1800 for a representative sample per phase (both `en` and `fa` where applicable) to confirm only the new UI is visible and no old chrome / purple gradients leak through.

## Confirmation before starting

If this phased plan is right, approve it and I'll execute **Phase 0** first (shared primitives), then pause so you can eyeball one restyled internal page before I fan out to the rest. Prefer a different order or want to trim scope? Reply with the change and I'll re-issue the plan.
