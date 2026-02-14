

# Add Predecessor/Successor Task and Request Fields

## Overview

Add four new relationship fields to the task form, allowing users to link tasks to their dependencies (predecessors) and dependents (successors) -- both tasks and requests.

## Layout

The new fields will be placed in the "Related Items" section (section 4), replacing the single "Related Task" dropdown with a structured group:

```
Related Task (existing, renamed to keep backward compat)

Predecessor Task    |  Predecessor Request
Successor Task      |  Successor Request

Related Letters ...
Related Documents ...
Related Files ...
```

## Changes

### 1. Database Migration

Add 4 new nullable columns to the `tasks` table:

```sql
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS predecessor_task_id uuid,
  ADD COLUMN IF NOT EXISTS predecessor_request_id uuid,
  ADD COLUMN IF NOT EXISTS successor_task_id uuid,
  ADD COLUMN IF NOT EXISTS successor_request_id uuid;
```

These are single-select fields (one predecessor task, one predecessor request, etc.), matching the existing `related_task_id` pattern.

### 2. NewTaskDialog.tsx

- Add `predecessorTaskId`, `predecessorRequestId`, `successorTaskId`, `successorRequestId` to `formData` state (all default to `''`)
- Add a `fetchRequests` function to load requests for the current project (from the `requests` table), and store in a `relatedRequests` state
- Call `fetchRequests` on dialog open
- Map the 4 new fields to database columns in the insert data object
- Add UI: two 2-column grid rows after the existing "Related Task" section:
  - Row 1: Predecessor Task (Select from tasks list) | Predecessor Request (Select from requests list)
  - Row 2: Successor Task (Select from tasks list) | Successor Request (Select from requests list)
- Reset all 4 fields on dialog close

### 3. TaskEditDialog.tsx

- Add the 4 new fields to `formData` state, initialized from task data
- Add `fetchRequests` function and `relatedRequests` state
- Call `fetchRequests` on dialog open
- Map the 4 fields in the update data object
- Add the same 2-column grid UI (admin gets Select dropdowns, non-admin gets read-only display)

### 4. Types

The `types.ts` file will auto-update after the migration.

## Files Changed

| File | Change |
|------|--------|
| Database migration | Add 4 columns to tasks table |
| `src/components/NewTaskDialog.tsx` | Add state, fetch, UI, and submit logic for 4 new fields |
| `src/components/TaskEditDialog.tsx` | Same changes with admin/non-admin handling |

