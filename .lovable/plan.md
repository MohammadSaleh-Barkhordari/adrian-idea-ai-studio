

# Drop `created_by` from Tasks + Add Cancellation Tracking

## Step 1: Database Migration

```sql
-- Remove created_by from tasks (user_id and assigned_by cover ownership)
ALTER TABLE tasks DROP COLUMN IF EXISTS created_by;

-- Add cancellation tracking columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS canceled_by uuid REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS canceled_at timestamp with time zone;
```

## Step 2: Fix Code References to `created_by` on Tasks (3 files)

| File | Change |
|------|--------|
| **`src/pages/DashboardPage.tsx`** | Line 123: Remove `created_by.eq.${user.id}` from the `.or()` filter -- keep `assigned_to` and `assigned_by`. Line 194: Remove `task.created_by === user?.id` from the `assignedByMe` filter -- `assigned_by` already covers this. |
| **`src/components/GanttChart.tsx`** | Line 13: Remove `created_by?: string` from the Task interface. |
| **`src/pages/ProjectDetailsPage.tsx`** | Line 90: Remove `created_by?: string` from the Task interface. |

Note: Other files referencing `created_by` (CustomerForm, EmployeeForm, NewProjectDialog, etc.) are for **other tables** and remain untouched.

## Step 3: Add Cancellation Auto-Set Logic

Same pattern as the existing `completed_at`/`completed_by` logic:

**In `TaskEditDialog.tsx` (handleSubmit):**
- When status changes to `cancelled`: set `canceled_at = new Date().toISOString()` and `canceled_by = currentUser.id`
- When status changes FROM `cancelled` to something else: set `canceled_at = null` and `canceled_by = null`
- Apply in both admin and non-admin update paths

**In `NewTaskDialog.tsx`:**
- If task is created with status `cancelled` (edge case): set `canceled_at` and `canceled_by`

## Summary of Files to Change

| File | Type |
|------|------|
| Database migration | Schema: drop `created_by`, add `canceled_by` + `canceled_at` |
| `src/pages/DashboardPage.tsx` | Remove `created_by` from query filter and categorization |
| `src/components/GanttChart.tsx` | Remove `created_by` from interface |
| `src/pages/ProjectDetailsPage.tsx` | Remove `created_by` from interface |
| `src/components/TaskEditDialog.tsx` | Add cancellation auto-set logic |
| `src/components/NewTaskDialog.tsx` | Add cancellation auto-set logic (edge case) |

