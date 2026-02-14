

# Fix: Task Fields Not Loading on Edit/View

## Root Cause

The Radix UI Select component does not handle empty string values (`""`) properly. When `value=""`, the Select renders blank -- no placeholder, no selected item. This makes it appear as if data didn't load.

All task relationship and assignment fields (Assigned To, Follow By, Confirm By, Related Task, Predecessor Task, Successor Task) are initialized as `""` when the database value is `null`, causing every Select dropdown to appear broken.

Additionally, "Assigned By" displays a raw UUID instead of an email because it uses a plain text Input.

## Database Verification

- Column names are correct: `assigned_to`, `assigned_by`, `follow_by`, `confirm_by`, `predecessor_task_id`, `successor_task_id`, `related_task_id`
- Both ProjectDetailsPage and DashboardPage fetch with `.select('*')` -- all columns are returned
- State initialization maps column names correctly
- The data in the database IS mostly `null` for these fields on recent tasks, which is expected

## Fix

### 1. TaskEditDialog.tsx -- Fix Select values

Change state initialization so empty/null values use the sentinel values that the Select options already expect:

- `assignedTo`: use `'unassigned'` instead of `''` when null
- `followBy`: use `'unassigned'` instead of `''` when null  
- `confirmBy`: use `'unassigned'` instead of `''` when null
- `relatedTaskId`: use `'none'` instead of `''` when null
- `predecessorTaskId`: use `'none'` instead of `''` when null
- `successorTaskId`: use `'none'` instead of `''` when null

This ensures Selects always have a valid value that matches one of their options.

### 2. TaskEditDialog.tsx -- Fix Assigned By display

Change "Assigned By" from a raw Input showing a UUID to either:
- A Select dropdown (for admin) matching the same pattern as Assigned To
- Or at minimum, resolve the UUID to an email using `getUserEmail()`

### 3. TaskDetailOutcomeDialog.tsx -- Verify display

The dashboard outcome dialog already displays these as read-only text using `getUserEmail()` and `getTaskName()`. Verify it handles null values gracefully (it does -- shows `'--'` for missing values).

## Files Changed

| File | Change |
|------|--------|
| `src/components/TaskEditDialog.tsx` | Fix state initialization to use sentinel values for Select components; fix Assigned By to show email instead of UUID |
| `src/components/TaskDetailOutcomeDialog.tsx` | Minor: ensure consistency (likely no changes needed) |
