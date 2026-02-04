
# Protected Pages - English LTR Layout Fix

## Summary

Apply the same fix from `DashboardPage.tsx` to all protected pages (admin, role-based, and email-whitelisted pages). These pages should:
- Always display in English
- Always use Left-to-Right (LTR) layout
- Keep the Navigation component language-aware (same as homepage)

## Pages to Modify

### Admin-Only Pages (require admin role)

| Page | File | Current Structure |
|------|------|-------------------|
| Projects | `src/pages/ProjectsPage.tsx` | `<div>` → `<Navigation />` → `<main>` |
| Project Details | `src/pages/ProjectDetailsPage.tsx` | `<div>` → `<Navigation />` → `<main>` |
| Financial Analysis | `src/pages/FinancialAnalysisPage.tsx` | `<div>` → `<Navigation />` → `<main>` |
| HR Management | `src/pages/HRManagementPage.tsx` | `<div>` → `<Navigation />` → `<main>` |
| Writing a Letter | `src/pages/WritingLetterPage.tsx` | `<div>` → `<Navigation />` → `<main>` |

### All Users Pages (require login)

| Page | File | Current Structure |
|------|------|-------------------|
| Create Document | `src/pages/CreateDocumentPage.tsx` | `<div>` → `<Navigation />` → `<main>` |
| Create Request | `src/pages/CreateRequestPage.tsx` | `<div>` → `<Navigation />` → `<main>` |

### Role-Based Pages (require any user role)

| Page | File | Current Structure |
|------|------|-------------------|
| Blog Dashboard | `src/pages/BlogDashboardPage.tsx` | Already has `dir` attribute on root |
| Blog Editor | `src/pages/BlogEditorPage.tsx` | Uses `isRTL` from context |

### Email-Whitelisted Pages ("Our Life" suite)

| Page | File | Current Structure |
|------|------|-------------------|
| Our Life | `src/pages/OurLifePage.tsx` | `<div>` → `<Navigation />` → `<main>` |
| Our Calendar | `src/pages/OurCalendarPage.tsx` | `<div>` → `<Navigation />` → `<main>` |
| Our Financial | `src/pages/OurFinancialPage.tsx` | `<div>` → `<Navigation />` → `<main>` |
| Our Todo | `src/pages/OurTodoPage.tsx` | `<div>` → `<Navigation />` → `<main>` |

## Implementation Pattern

For each page, apply this structure:

```text
┌─────────────────────────────────────────────┐
│ <div className="min-h-screen bg-background">│  ← No dir attribute
│   <Navigation />                            │  ← Language-aware (RTL/LTR)
│   <main ... dir="ltr">                      │  ← Force LTR
│     [Page Content with text-left classes]   │
│   </main>                                   │
│   <Footer />                                │
│ </div>                                      │
└─────────────────────────────────────────────┘
```

## Detailed Changes

### 1. ProjectsPage.tsx (line 171)
**Before:**
```tsx
<main className="container mx-auto px-6 py-20">
```
**After:**
```tsx
<main className="container mx-auto px-6 py-20" dir="ltr">
```

### 2. ProjectDetailsPage.tsx (line 380)
**Before:**
```tsx
<main className="container mx-auto px-4 pt-20 pb-8">
```
**After:**
```tsx
<main className="container mx-auto px-4 pt-20 pb-8" dir="ltr">
```

### 3. FinancialAnalysisPage.tsx (line 444)
**Before:**
```tsx
<main className="container mx-auto px-6 py-20">
```
**After:**
```tsx
<main className="container mx-auto px-6 py-20" dir="ltr">
```

### 4. HRManagementPage.tsx (line 275)
**Before:**
```tsx
<main className="container mx-auto px-6 pt-20 pb-8">
```
**After:**
```tsx
<main className="container mx-auto px-6 pt-20 pb-8" dir="ltr">
```

### 5. WritingLetterPage.tsx (line 362)
**Before:**
```tsx
<main className="container mx-auto px-6 py-20">
```
**After:**
```tsx
<main className="container mx-auto px-6 py-20" dir="ltr">
```

### 6. CreateDocumentPage.tsx (line 12)
**Before:**
```tsx
<main className="container mx-auto px-4 py-8 pt-24">
```
**After:**
```tsx
<main className="container mx-auto px-4 py-8 pt-24" dir="ltr">
```

### 7. CreateRequestPage.tsx (line 192)
**Before:**
```tsx
<main className="container mx-auto px-4 pt-20 pb-8">
```
**After:**
```tsx
<main className="container mx-auto px-4 pt-20 pb-8" dir="ltr">
```

### 8. BlogDashboardPage.tsx (line 243)
**Current:** Uses `dir={isRTL ? 'rtl' : 'ltr'}` on root div - forces Navigation to follow interface language
**Change:** Move `dir="ltr"` to `<main>` only
**Before:**
```tsx
<div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
  <Navigation />
  <main className="flex-1 container mx-auto px-4 py-8 mt-20">
```
**After:**
```tsx
<div className="min-h-screen flex flex-col">
  <Navigation />
  <main className="flex-1 container mx-auto px-4 py-8 mt-20" dir="ltr">
```

### 9. OurLifePage.tsx (line 92)
**Before:**
```tsx
<main className="container mx-auto px-6 py-20">
```
**After:**
```tsx
<main className="container mx-auto px-6 py-20" dir="ltr">
```

### 10. OurCalendarPage.tsx (line 55)
**Before:**
```tsx
<main className="container mx-auto px-4 py-8 pt-24">
```
**After:**
```tsx
<main className="container mx-auto px-4 py-8 pt-24" dir="ltr">
```

### 11. OurFinancialPage.tsx (line 314)
**Before:**
```tsx
<main className="container mx-auto px-6 py-20">
```
**After:**
```tsx
<main className="container mx-auto px-6 py-20" dir="ltr">
```

### 12. OurTodoPage.tsx (line 163)
**Before:**
```tsx
<main className="container mx-auto px-4 py-8 pt-24">
```
**After:**
```tsx
<main className="container mx-auto px-4 py-8 pt-24" dir="ltr">
```

## Expected Outcome

After implementation:

| Component | Behavior |
|-----------|----------|
| Navigation | Follows language context (RTL for Persian routes, LTR for English routes) - same as homepage |
| All protected page content | Always LTR with English text alignment |
| Cards, forms, tables | Flow from left to right |
| Text | Aligned left |
| Icons | Appear on the left of text |

## Files Modified (12 total)

1. `src/pages/ProjectsPage.tsx`
2. `src/pages/ProjectDetailsPage.tsx`
3. `src/pages/FinancialAnalysisPage.tsx`
4. `src/pages/HRManagementPage.tsx`
5. `src/pages/WritingLetterPage.tsx`
6. `src/pages/CreateDocumentPage.tsx`
7. `src/pages/CreateRequestPage.tsx`
8. `src/pages/BlogDashboardPage.tsx`
9. `src/pages/OurLifePage.tsx`
10. `src/pages/OurCalendarPage.tsx`
11. `src/pages/OurFinancialPage.tsx`
12. `src/pages/OurTodoPage.tsx`
