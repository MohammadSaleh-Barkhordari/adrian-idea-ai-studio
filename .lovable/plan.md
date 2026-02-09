

# Show Task Details in Edit Dialog for All Users

## Problem

When opening the task edit dialog, users cannot see key task details like Task Name, Project, Assigned By, Priority, Status, and Due Date. These should always be visible as read-only context at the top of the dialog, regardless of user role.

The task in question ("بررسی پلان کارخانه") stores its name in the `title` column (not `task_name`), so the display must check both fields.

## Changes

### `src/components/TaskEditDialog.tsx`

1. Add a read-only "Task Details" summary card at the **top of the form** that is visible to **all users** (admins and non-admins alike).

2. This card will display:

| Field | Source |
|-------|--------|
| Task Name | `task.task_name` or `task.title` |
| Project | `task.project_id` (or `task.project_name` if available) |
| Assigned To | Resolved from `users` via `getUserDisplayName()` |
| Assigned By | Resolved from `users` via `getUserDisplayName()` |
| Priority | Badge component |
| Status | Badge component |
| Due Date | Formatted date |
| Start Time | Formatted date/time |

3. This section is **display-only** -- no form inputs, just text and badges.

4. The existing editable fields (admin-only fields and notes/outcome for all users) remain unchanged below this summary.

### Layout

```text
+------------------------------------------+
| Edit Task / Update Task Outcome          |
+------------------------------------------+
| Task Details (read-only card)            |
| Task Name: بررسی پلان کارخانه            |
| Project: PROJ-20250921-950               |
| Assigned To: [name]  | Assigned By: ---  |
| Priority: [medium]   | Status: [todo]    |
| Due Date: Feb 9, 2026| Start: Feb 9 ...  |
+------------------------------------------+
| [Admin-only editable fields if admin]    |
| Notes (editable textarea)               |
| Outcome (editable textarea)             |
| File Upload                             |
+------------------------------------------+
```

### Technical Details

- Replace the current `canEditOutcomeOnly`-gated read-only section with one that shows for **all users**
- Use `task.task_name || task.title || '—'` to handle both column names
- Use the existing `getUserDisplayName()` helper to resolve user IDs
- Use `Badge` for priority and status display
- Use `format()` from date-fns for date formatting

### Files Changed

| File | Change |
|------|--------|
| `src/components/TaskEditDialog.tsx` | Replace conditional read-only section with an always-visible task details card at top of dialog |

