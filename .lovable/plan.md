

# Fix Task Edit Dialog - Show All Task Details

## Problem

When editing a task, several important fields are missing from the edit form even though they exist in the database. The dialog only shows task name, priority, status, due date, notes, outcome, and files. Missing fields include: assigned_to, assigned_by, task_type, description, related_task_id, follow_by, and start_time.

## Changes

### `src/components/TaskEditDialog.tsx`

Add the following form fields to the admin section of the edit dialog (inside the `canEditAllFields` blocks):

| Field | Type | Description |
|-------|------|-------------|
| `description` | Textarea | Task description |
| `assigned_to` | Select dropdown | User assigned to the task (populated from profiles table) |
| `assigned_by` | Select dropdown | User who assigned the task (populated from profiles table) |
| `follow_by` | Select dropdown | User responsible for follow-up (populated from profiles table) |
| `task_type` | Select dropdown | Task type (general, meeting, review, etc.) |
| `related_task_id` | Select dropdown | Link to another task in the same project |
| `start_time` | Date/Time picker | Task start time (already has state, just needs UI) |

For the user dropdowns (`assigned_to`, `assigned_by`, `follow_by`), fetch the list of users from the `profiles` table on dialog open.

For the `related_task_id` dropdown, fetch tasks from the same project to allow linking.

### Technical Details

1. Add a `useEffect` to fetch profiles when the dialog opens:
   ```
   Fetch from profiles table: id, email, full_name
   Store in a users state array
   ```

2. Add a `useEffect` to fetch project tasks for the related task dropdown:
   ```
   Fetch from tasks table where project_id matches, exclude current task
   ```

3. Add `description` and `follow_by` to the form's `defaultValues` and `form.reset()`

4. Render all missing fields in the admin-only grid section, using Select components for dropdowns and showing user names (not UUIDs)

### Layout

The form grid will be organized as:
- Row 1: Task Name, Task Type
- Row 2: Priority, Status
- Row 3: Assigned To, Assigned By
- Row 4: Follow Up By, Related Task
- Row 5: Due Date, Start Time
- Full width: Description
- Full width: Notes
- Full width: Outcome
- Full width: File upload

### Files Changed

| File | Change |
|------|--------|
| `src/components/TaskEditDialog.tsx` | Add missing form fields, fetch profiles and related tasks |

