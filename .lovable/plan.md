

# Remove Predecessor/Successor Request Fields

## Overview

Remove the "Predecessor Request" and "Successor Request" fields from the task forms and database, keeping only the task-based predecessor/successor relationships.

## Changes

### 1. Database Migration

Drop the two request columns from the `tasks` table:

```sql
ALTER TABLE public.tasks
  DROP COLUMN IF EXISTS predecessor_request_id,
  DROP COLUMN IF EXISTS successor_request_id;
```

### 2. NewTaskDialog.tsx

- Remove `predecessorRequestId` and `successorRequestId` from `formData` state and reset logic
- Remove `relatedRequests` state and the `fetchRelatedRequests` function + its call in useEffect
- Remove `predecessor_request_id` and `successor_request_id` from the insert data object
- Remove the `RequestItem` type (if only used here)
- Change the Predecessor/Successor grid layout from `grid-cols-2` to single-column (one field per row: Predecessor Task, then Successor Task)

### 3. TaskEditDialog.tsx

- Same removals: `predecessorRequestId`, `successorRequestId` from state, initialization, and update data
- Remove `relatedRequests` state, `fetchRelatedRequests` function and its call
- Remove the `RequestItem` type
- Simplify Predecessor/Successor UI from 2-column grid to single-column (Predecessor Task, Successor Task)

### 4. Types

The `types.ts` file will auto-update after the migration removes the columns.

## Files Changed

| File | Change |
|------|--------|
| Database migration | Drop `predecessor_request_id` and `successor_request_id` columns |
| `src/components/NewTaskDialog.tsx` | Remove request-related state, fetch, UI, and submit logic |
| `src/components/TaskEditDialog.tsx` | Same removals with admin/non-admin handling |

