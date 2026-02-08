
## What the log means (why task creation fails)
Your browser log shows:

- `new row for relation "tasks" violates check constraint "tasks_status_check"` (code `23514`)

Your database only allows these task `status` values:
- `todo`, `in_progress`, `completed`, `cancelled`

But the Task Creation form currently sends:
- `status: "pending"` (default in `NewTaskDialog.tsx`), which is not allowed, so the insert is rejected.

I confirmed this by checking the database constraint definition (`tasks_status_check`) and by reading `src/components/NewTaskDialog.tsx`, which currently renders a Status dropdown containing `pending`.

## Goal
Make task creation succeed by ensuring the UI only sends allowed status values (and displays them correctly across the app).

## Changes to implement (no database changes needed)

### 1) Fix the task creation dialog to use valid status values
File: `src/components/NewTaskDialog.tsx`

- Change default `formData.status` from `pending` → `todo`
- Update the Status dropdown options:
  - Replace `pending` with `todo` (label “To Do”)
- Update the form reset in `handleClose()` similarly (`status: 'todo'`)

Result: creating a task for a project will no longer violate `tasks_status_check`.

### 2) Fix the task edit dialog (currently also uses invalid “pending”)
File: `src/components/TaskEditDialog.tsx`

- Change react-hook-form default status fallback from `pending` → `todo`
- Update the Status select items:
  - Replace `pending` with `todo` (label “To Do”)

Why this matters: even after task creation is fixed, editing a task could still fail if the UI tries to set `pending`.

### 3) Update task status display helpers to recognize `todo`
File: `src/pages/ProjectDetailsPage.tsx`

- Update `getTaskStatusColor()` to handle `todo` explicitly (so “To Do” tasks don’t fall into the default/gray styling)
- Optional polish: adjust `formatStatus()` so `todo` displays as “To Do” (instead of “Todo”)

### 4) Update dashboard filtering & labels to use `todo` (not `pending`)
File: `src/pages/DashboardPage.tsx`

- Replace any filtering logic that includes `pending` with `todo`
  - Example: `.in('status', ['todo', 'in_progress', ...])` should not reference `pending`
- Update any Status filter dropdown items:
  - Replace “Pending” with “To Do” (value `todo`)
- Update empty-state copy like “No pending tasks” to “No to-do tasks” (or “No tasks” depending on intent)

### 5) Update Gantt chart status mapping/legend
File: `src/components/GanttChart.tsx`

- Replace color mapping and legend entries using `pending` with `todo`
- Ensure `todo`, `in_progress`, `completed`, `cancelled` all map to sensible colors

## Backward compatibility (safety)
Even though your database currently has no `pending` statuses, I’ll add a small defensive mapping in the UI where appropriate:
- If any task status is unexpectedly `pending` (from old data), display it as “To Do”
- Never write `pending` back to the database

## Test plan (end-to-end)
1. Go to a project details page (like `/projects/PROJ-20251012-660`)
2. Click “Add Task”
3. Create a task with default status (should save successfully)
4. Create tasks with each status: To Do, In Progress, Completed, Cancelled
5. Edit an existing task and change status; confirm update succeeds and UI updates correctly
6. Confirm dashboard filters still show the expected tasks

## Scope note
This plan focuses on fixing the “cannot create task” blocker shown in the log (invalid status). Your previous “email vs UUID” fix was correct, but the status constraint is a separate issue that still prevents inserts.
