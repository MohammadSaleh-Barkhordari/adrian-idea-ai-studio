

# Show Task Details in Edit Dialog for All Users

## Problem

When non-admin users open the task edit dialog, they only see Notes, Outcome, and File upload fields. Important task context like Task Name, Project, Assigned By, Priority, Status, and Due Date are hidden because they are wrapped in `canEditAllFields` (admin-only) blocks.

Users need to see these details as **read-only information** so they have context about the task they are updating.

## Changes

### `src/components/TaskEditDialog.tsx`

Add a read-only "Task Details" summary section at the top of the dialog that is visible to **all users** (not just admins). This section will display:

| Field | Display |
|-------|---------|
| Task Name | Text |
| Project | Project name (from `task.project_name`) |
| Assigned By | User name (resolved from profiles) |
| Priority | Badge |
| Status | Badge |
| Due Date | Formatted date |

This summary section will only appear for non-admin users (since admins already see all editable fields). It will be rendered as a read-only card/grid above the Notes and Outcome fields.

Additionally, resolve the `assigned_by` UUID to a display name using the already-fetched `users` array and the existing `getUserDisplayName()` helper function.

### Technical Details

1. Move the `fetchUsers()` call outside the `canEditAllFields` guard so it runs for all users (it already does -- the `useEffect` runs unconditionally).

2. Add a read-only section before the editable fields when `canEditOutcomeOnly` is true:
   ```
   if (canEditOutcomeOnly) {
     Render a grid showing:
     - Task Name: task.task_name or task.title
     - Project: task.project_name
     - Assigned By: getUserDisplayName(task.assigned_by)
     - Priority: Badge with task.priority
     - Status: Badge with task.status
     - Due Date: formatted task.due_date
   }
   ```

3. These fields are display-only (no form inputs), using simple text and Badge components.

### Layout for Non-Admin Users

```
+----------------------------------+
| Task Details (read-only card)    |
| Task Name: ...   | Project: ...  |
| Assigned By: ... | Priority: ... |
| Status: ...      | Due Date: ... |
+----------------------------------+
| Notes (editable textarea)        |
| Outcome (editable textarea)      |
| File Upload                      |
+----------------------------------+
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/TaskEditDialog.tsx` | Add read-only task details section for non-admin users |

