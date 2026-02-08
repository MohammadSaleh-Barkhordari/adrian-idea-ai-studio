

# Fix OurTodoPage Styling Inconsistency

## Problem

The `/our-todo` page has a different color and style because it uses a hardcoded dark gradient background instead of the standard theme-aware background used by all other internal pages.

**Current styling (OurTodoPage):**
```jsx
<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
```

**Expected styling (matching DashboardPage, ProjectsPage, OurLifePage, etc.):**
```jsx
<div className="min-h-screen bg-background">
```

## Visual Comparison

| Page | Background Class | Result |
|------|------------------|--------|
| `/dashboard` | `bg-background` | Theme-aware (light/dark) |
| `/projects` | `bg-background` | Theme-aware (light/dark) |
| `/our-life` | `bg-background` | Theme-aware (light/dark) |
| `/our-todo` | `bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900` | Fixed dark purple/blue gradient |

## Solution

Update `OurTodoPage.tsx` to use `bg-background` instead of the hardcoded gradient, matching the styling pattern of other internal pages.

## Changes Required

### File: `src/pages/OurTodoPage.tsx`

1. **Update loading state (line 245)**:
   - From: `bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900`
   - To: `bg-background`

2. **Update main container (line 249)**:
   - From: `bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900`
   - To: `bg-background`

## Result

After this change, the `/our-todo` page will:
- Match the visual style of all other internal pages
- Properly respond to light/dark theme changes
- Follow the project's established styling conventions

