

# Dashboard Cards - English LTR Layout Plan

## Problem Summary

The dashboard feature cards currently:
- Have hardcoded English titles/descriptions (Projects, Financial Analysis, HR Management, etc.)
- Are displaying in RTL (Right-to-Left) direction when accessed from Persian routes
- Should always display in English with LTR (Left-to-Right) layout regardless of the site language

## Current Behavior Analysis

| Item | Current State |
|------|--------------|
| Card Titles | Hardcoded in English in `DashboardPage.tsx` (lines 357-420) |
| Card Descriptions | Hardcoded in English |
| Layout Direction | Follows global `isRTL` from LanguageContext (RTL on Persian routes) |
| Route | Only `/dashboard` - no language prefix |

## Solution Approach

The dashboard is an internal administrative tool meant for English-speaking operations. The fix should:
1. Force LTR direction on the entire dashboard page
2. Keep the cards in English (already done)
3. Make the welcome message and section headers language-aware but layout-fixed

## Implementation Steps

### Step 1: Force LTR Direction on Dashboard Page

Add a wrapper div with explicit `dir="ltr"` and `text-left` classes to override the RTL direction inherited from the root document.

**File: `src/pages/DashboardPage.tsx`**

Changes to the main container (around line 421):
```tsx
return <div className="min-h-screen bg-background" dir="ltr">
```

### Step 2: Ensure Text Alignment is LTR

Update the dashboard cards grid to ensure proper left-to-right flow:
- Add `text-left` class to card content
- Ensure flex items align from the start

**Affected Areas:**
- Welcome header section
- Dashboard cards grid
- My Tasks section
- My Requests section (for admins)

### Step 3: Update Card Content Structure

Ensure the card layout flows correctly in LTR:
```tsx
<CardHeader>
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-accent/10">
      <item.icon className={`h-6 w-6 ${item.color}`} />
    </div>
    <CardTitle className="text-lg text-left">{item.title}</CardTitle>
  </div>
</CardHeader>
```

## Dashboard Items (Remain in English)

| Card | Access Level | Current Title (English) |
|------|--------------|------------------------|
| Projects | Admin only | Projects |
| Financial Analysis | Admin only | Financial Analysis |
| HR Management | Admin only | HR Management |
| Writing a Letter | Admin only | Writing a Letter |
| Creating a Document | Admin only | Creating a Document |
| Create a Request | All users | Create a Request |
| Blog Dashboard | Users with role | Blog Dashboard |
| Our Life | Email whitelist only | Our Life |

## Files to Modify

1. **`src/pages/DashboardPage.tsx`**
   - Add `dir="ltr"` to the root container
   - Add `text-left` classes to ensure proper text alignment
   - Optionally add LTR-specific flex ordering if needed

## Expected Outcome

After implementation:
- Dashboard page always renders in Left-to-Right direction
- All cards display English text aligned left
- Icon appears on the left, title on the right
- Grid flows from left to right (first card top-left, not top-right)
- This applies regardless of whether user navigated from Persian or English public site

## Visual Before/After

**Before (Current RTL):**
```
[Our Life] [Blog Dashboard] [Create a Request]
[Creating a Document] [Writing a Letter] [HR Management]
[Financial Analysis] [Projects]
```

**After (LTR):**
```
[Projects] [Financial Analysis] [HR Management]
[Writing a Letter] [Creating a Document] [Create a Request]
[Blog Dashboard] [Our Life]
```

