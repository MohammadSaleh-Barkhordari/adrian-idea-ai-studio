

# Add "Confirm By" Field to Task Management

## Overview

Add a new "Confirm By" person selector field next to "Follow Up By" in both NewTaskDialog and TaskEditDialog. This field tracks who should verify that a task was completed correctly.

## Changes

### 1. Database Migration

Add a `confirm_by` column to the `tasks` table, matching the `follow_by` column pattern (text type, nullable):

```sql
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS confirm_by text;
```

### 2. NewTaskDialog.tsx

- Add `confirmBy: ''` to `formData` state
- Add `confirm_by` to the insert data mapping: `confirm_by: formData.confirmBy === 'unassigned' ? null : formData.confirmBy || null`
- Change the "Follow Up By" section from a single full-width field to a 2-column grid layout:
  - Left: Follow Up By (existing)
  - Right: Confirm By (new, same user selector pattern)

### 3. TaskEditDialog.tsx

- Add `confirmBy` to `formData` state, initialized from `task.confirm_by`
- Add `confirm_by` to the update data mapping
- Same 2-column layout change: Follow Up By + Confirm By side by side

### Layout Result

```
Assigned By          | Assigned To
Follow Up By         | Confirm By
Start Date           | Due Date
```

No other files need changes. The types file will auto-update after the migration.

