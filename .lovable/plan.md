

# Keep Navigation Consistent with Homepage

## Problem

The `dir="ltr"` attribute was added to the root container of DashboardPage, which forces the entire page (including Navigation) to render Left-to-Right. This breaks the Navigation's language-aware behavior - it should follow RTL for Persian routes and LTR for English routes, just like on the homepage.

## Solution

Move the `dir="ltr"` attribute from the root container to only wrap the main dashboard content, keeping Navigation outside of the LTR-forced area.

## Current Structure (Problematic)

```tsx
<div className="min-h-screen bg-background" dir="ltr">  // Forces ALL content LTR
  <Navigation />  // Navigation is incorrectly forced LTR
  <main>...</main>
</div>
```

## Proposed Structure

```tsx
<div className="min-h-screen bg-background">  // No dir attribute
  <Navigation />  // Navigation follows language context (RTL/LTR)
  <main className="container mx-auto px-6 py-20" dir="ltr">  // Only main content is LTR
    ...dashboard cards...
  </main>
</div>
```

## File to Modify

**`src/pages/DashboardPage.tsx`**

1. Remove `dir="ltr"` from the root `<div>` (line 421)
2. Add `dir="ltr"` to the `<main>` element (line 424)

## Expected Outcome

| Element | Behavior |
|---------|----------|
| Navigation | Follows language context (RTL for Persian, LTR for English) |
| Dashboard Cards | Always LTR with English text |
| Welcome Header | Always LTR with English text |
| Tasks/Requests | Always LTR |

