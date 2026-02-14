

# Batch 1: Database Migration + Code Reference Fixes

## Step 1: Database Migration

Single SQL migration to restructure the tasks table:

```sql
-- Drop duplicate columns
ALTER TABLE tasks DROP COLUMN IF EXISTS title;
ALTER TABLE tasks DROP COLUMN IF EXISTS completion_date;

-- Rename columns
ALTER TABLE tasks RENAME COLUMN completion_notes TO outcome_notes;
ALTER TABLE tasks RENAME COLUMN outcome_audio_url TO outcome_audio_path;

-- Add new columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS outcome_has_files boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS outcome_audio_transcription text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description_audio_path text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description_audio_transcription text;
```

**Note:** `task_name` already exists and has data. After dropping `title`, all code must use `task_name`.

---

## Step 2: Fix All Code References (10 files)

### Frontend Files

| File | Changes |
|------|---------|
| **`src/components/NewTaskDialog.tsx`** | Line 317: remove `title: formData.taskName.trim()` from insert. Line 157: change `.select('id, title')` to `.select('id, task_name')`. Line 162: update mapping from `t.title` to `t.task_name`. |
| **`src/components/TaskEditDialog.tsx`** | Line 162: change `.select('id, title, task_name')` to `.select('id, task_name')`. Line 246: remove `title: formData.taskName`. Lines 112/116/118/123/256/260/265-266/281: rename `completion_notes` to `outcome_notes`, `completion_date` to use `completed_at` (auto-set), `outcome_audio_url` to `outcome_audio_path`. |
| **`src/components/GanttChart.tsx`** | Line 10: change interface `title` to `task_name`. Line 66: `task.title` to `task.task_name`. Line 457: `task.title` to `task.task_name`. |
| **`src/pages/ProjectDetailsPage.tsx`** | Line 581: `task.title` to `task.task_name`. Line 1020: `taskToDelete?.title` to `taskToDelete?.task_name`. |
| **`src/pages/DashboardPage.tsx`** | Lines 204/614/677: all `task.title` references to `task.task_name`. Remove `|| task.task_name` fallbacks since `task_name` is now the only column. |

### Edge Functions (4 files)

| File | Changes |
|------|---------|
| **`supabase/functions/task-due-reminders/index.ts`** | Line 35: `title` to `task_name` in select. Lines 110/114: `.title` to `.task_name`. |
| **`supabase/functions/send-overdue-reminders/index.ts`** | Line 32: `title` to `task_name` in select. Line 117: `.title` to `.task_name`. |
| **`supabase/functions/send-daily-agenda/index.ts`** | Line 80: `title` to `task_name` in select. Lines 108/120: `.title` to `.task_name`. |
| **`supabase/functions/send-comment-notification/index.ts`** | Line 37: `title` to `task_name` in select. Line 135: `task.title` to `task.task_name`. |

---

## Step 3: Add `completed_by` Auto-Set Logic

In **`TaskEditDialog.tsx`** (handleSubmit):
- When status changes to `completed`: add `completed_at: new Date().toISOString()` and `completed_by: currentUser.id` to `updateData`
- When status changes FROM `completed` to something else: set `completed_at: null` and `completed_by: null`
- Remove manual `completion_date` picker references (the date is now auto-set via `completed_at`)
- Apply same logic in the non-admin update path

In **`NewTaskDialog.tsx`**:
- If task is created with status `completed` (unlikely but possible): set `completed_at` and `completed_by` in the insert

---

## What This Does NOT Touch (saved for Batch 2)

- No UI layout changes
- No new textareas or voice recorder boxes
- No description field additions to the form
- No visual changes at all

After this batch, we verify the app works (task creation, editing, gantt chart, dashboard, edge function notifications) before proceeding with Batch 2 UI changes.

