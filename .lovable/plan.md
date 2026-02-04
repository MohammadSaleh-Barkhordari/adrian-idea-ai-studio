
# Project Restoration Plan from GitHub Repository

## Overview

Your project source code is fully available in your GitHub repository. I will restore all files by fetching them directly from GitHub's raw content URLs and recreating them in your Lovable project.

---

## Repository Analysis

**Repository:** `https://github.com/MohammadSaleh-Barkhordari/adrian-idea-ai-studio`

### Files to Restore

Based on the GitHub tree analysis, here's the complete file inventory:

| Category | File Count | Key Files |
|----------|------------|-----------|
| Core Files | 4 | `App.tsx`, `main.tsx`, `index.css`, `vite-env.d.ts`, `App.css` |
| Pages | 27 | All pages including Dashboard, Projects, Auth, Blog, Financial, etc. |
| Components | 45+ | Navigation, Footer, Dialogs, Forms, Charts, etc. |
| UI Components | 55+ | All shadcn/ui components (button, card, dialog, etc.) |
| Hooks | 4 | `use-toast.ts`, `use-mobile.tsx`, `usePushNotifications.ts`, `useSmoothScroll.ts` |
| Contexts | 1 | `LanguageContext.tsx` |
| Translations | 3 | `en.ts`, `fa.ts`, `index.ts` |
| Lib/Utils | 2 | `utils.ts`, `notifications.ts` |
| Supabase Integration | 2 | `client.ts`, `types.ts` |
| Edge Functions | 15 | All backend functions |
| Styles | 1 | `quill-custom.css` |

---

## Restoration Strategy

### Phase 1: Core Application Files
1. `src/App.tsx` - Main application with routing
2. `src/main.tsx` - Entry point with providers
3. `src/index.css` - Complete design system and styles
4. `src/vite-env.d.ts` - TypeScript environment types
5. `src/App.css` - Additional app styles

### Phase 2: Pages (27 files)
All page components from `src/pages/`:
- **Public Pages:** Index, AboutPage, ServicesPage, CaseStudiesPage, AIPhilosophyPage, ContactPage, BlogPage, BlogPostPage, NotFound
- **Auth:** AuthPage
- **Protected Pages:** DashboardPage, ProjectsPage, ProjectDetailsPage, WritingLetterPage, FinancialAnalysisPage, HRManagementPage, CreateDocumentPage, CreateRequestPage, OurLifePage, OurFinancialPage, OurCalendarPage, OurTodoPage, BlogDashboardPage, BlogEditorPage, InstallAppPage
- **Legal Pages (FA):** PrivacyPolicyPage, TermsOfServicePage, CookiePolicyPage, DataProcessingPage (in fa/ subfolder)
- **Legal Pages (EN):** PrivacyPolicyPage, TermsOfServicePage, CookiePolicyPage, DataProcessingPage

### Phase 3: Components (45+ files)
All reusable components from `src/components/`:
- Navigation, Footer, Hero, About, Services, Contact, etc.
- Dialogs: NewProjectDialog, NewTaskDialog, NewLetterDialog, EventDialog, etc.
- Forms: EmployeeForm, VoiceRecorder, FileUpload components
- Specialized: GanttChart, TimeSlotView, LetterBuilder, MediaLibrary, etc.
- Utility: ScrollToTop, ThemeProvider, LanguageSwitcher, etc.

### Phase 4: UI Components (55+ files)
All shadcn/ui components from `src/components/ui/`:
- Primitives: button, input, label, textarea, checkbox, radio-group
- Layout: card, dialog, sheet, drawer, popover, tooltip
- Navigation: navigation-menu, menubar, breadcrumb, tabs
- Forms: form, select, calendar, command, combobox
- Feedback: toast, toaster, alert, progress, skeleton
- Data Display: table, accordion, avatar, badge, separator
- Advanced: carousel, chart, resizable, scroll-area, sidebar

### Phase 5: Hooks & Contexts
- `src/hooks/use-toast.ts`
- `src/hooks/use-mobile.tsx`
- `src/hooks/usePushNotifications.ts`
- `src/hooks/useSmoothScroll.ts`
- `src/contexts/LanguageContext.tsx`

### Phase 6: Translations & Utils
- `src/translations/en.ts`
- `src/translations/fa.ts`
- `src/translations/index.ts`
- `src/lib/utils.ts`
- `src/lib/notifications.ts`
- `src/styles/quill-custom.css`

### Phase 7: Supabase Edge Functions (15 functions)
All edge functions from `supabase/functions/`:
1. analyze-contract
2. analyze-document
3. analyze-financial-document
4. analyze-letter
5. calendar-event-reminders
6. create-letter-image
7. extract-financial-fields
8. extract-letter-fields
9. extract-our-financial-fields
10. generate-blog-image
11. generate-letter
12. get-auth-users
13. send-push-notification
14. task-due-reminders
15. voice-to-text

---

## Technical Details

### Source URLs
Files will be fetched from GitHub raw content:
```
https://raw.githubusercontent.com/MohammadSaleh-Barkhordari/adrian-idea-ai-studio/main/{path}
```

### Database Schema
The existing Lovable Cloud database schema remains unchanged - this restoration only affects the frontend code and edge functions.

### Authentication System
The AuthPage will be restored with:
- Email/password sign-in
- Email/password sign-up
- Session management via Supabase

### Protected Routes
After restoration, these routes will require authentication:
- `/dashboard`
- `/projects`, `/projects/:projectId`
- `/writing-letter`, `/financial-analysis`
- `/hr-management`, `/create-document`, `/create-request`
- `/our-life`, `/our-financial`, `/our-calendar`, `/our-todo`
- `/dashboard/blog`, `/dashboard/blog/new`, `/dashboard/blog/edit/:id`

---

## Execution Plan

I will restore files in batches to ensure efficient implementation:

1. **Batch 1:** Core files (App.tsx, main.tsx, index.css, etc.)
2. **Batch 2:** Contexts, hooks, and utilities
3. **Batch 3:** UI components (all shadcn components)
4. **Batch 4:** Custom components (part 1 - dialogs and forms)
5. **Batch 5:** Custom components (part 2 - sections and features)
6. **Batch 6:** Pages (part 1 - public and auth pages)
7. **Batch 7:** Pages (part 2 - protected pages)
8. **Batch 8:** Translations and styles
9. **Batch 9:** Edge functions

---

## Expected Result

After restoration:
- Full application functionality restored
- All 27+ pages working
- All 100+ components available
- Bilingual support (English/Persian) active
- Edge functions deployed for AI features
- Authentication and protected routes operational
- Your existing database data preserved

---

## Notes

- The `.env`, `supabase/config.toml`, and `src/integrations/supabase/client.ts` files are auto-generated by Lovable Cloud and will not be modified
- Image assets in `src/assets/` and `public/` are already present in your project
- No database migrations needed - schema remains unchanged
