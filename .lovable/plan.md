

# Redesign TaskEditDialog with Creation Form Layout and Role-Based Access

## Database Migration

Add two new columns to the `tasks` table:
- `completion_notes` (text, nullable)
- `completion_date` (date, nullable)

The `outcome` column already exists.

## TaskEditDialog.tsx -- Complete Rewrite

Rewrite the component to mirror the `NewTaskDialog` form layout exactly, with role-based behavior layered on top.

### Structure Changes

- Switch from `react-hook-form` + `Form`/`FormField` pattern to the simpler `useState` + `Label`/`Input` pattern used in `NewTaskDialog`
- Use `ScrollArea` for the form body (same as NewTaskDialog)
- Dialog size: `sm:max-w-[500px] max-h-[90vh]` (matching NewTaskDialog)

### Data Fetching

Same as current, plus:
- Fetch project name from `adrian_projects` where `project_id` matches -- display project name instead of raw ID
- Fetch auth users via `get-auth-users` edge function (matching NewTaskDialog pattern) instead of profiles table
- Fetch related tasks from same project

### Form Fields (in NewTaskDialog order, pre-filled)

1. **Task Name** -- text input, pre-filled with `task.task_name || task.title`
2. **Related Task** -- dropdown from project tasks
3. **Assigned By / Assigned To** -- side-by-side row (Assigned By as text input, Assigned To as user dropdown)
4. **Follow Up By** -- user dropdown
5. **Start Date / Due Date** -- side-by-side date pickers
6. **Priority / Status** -- side-by-side dropdowns
7. **Outcome** -- text input
8. **Outcome File** -- file upload
9. **Description** -- textarea
10. **Notes** -- textarea

### Role-Based Behavior

**Admin (`userRole === 'admin'`):**
- All fields are normal editable inputs/dropdowns/date pickers (identical to creation form)
- On submit: update ALL fields in the tasks table
- Button text: "Update Task"

**Non-admin (general user):**
- All the above fields render in the same layout but as **disabled/read-only** elements:
  - Text inputs: `disabled` prop + style `bg-[#f5f5f5] rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed`
  - Dropdowns: `disabled` prop on SelectTrigger with same gray styling
  - Date pickers: disabled button with same gray styling
- Below the read-only form, a visually separated section:
  - Wrapper: `border-l-4 border-blue-400 pl-4 mt-6`
  - Heading: "Your Task Update" (font-medium)
  - Editable fields:
    - **Status** -- dropdown limited to "In Progress" and "Done" only
    - **Outcome** -- textarea, placeholder: "Describe what you did..."
    - **Completion Notes** -- textarea, placeholder: "Any additional notes..."
    - **Completion Date** -- date picker
- File upload remains available to all users
- On submit: ONLY update `outcome`, `completion_notes`, `completion_date`, `status`, and files

### Submit Logic

```text
if admin:
  updateData = {
    task_name, priority, status, assigned_to, assigned_by,
    follow_by, task_type, description, notes, outcome,
    related_task_id, due_date, start_time
  }
else:
  updateData = {
    outcome, completion_notes, completion_date, status (restricted)
  }
```

Both roles can upload files.

### Existing Files Section

Keep the existing files display and removal functionality (download/remove buttons) for all users.

### Files Changed

| File | Change |
|------|--------|
| Database migration | Add `completion_notes` (text) and `completion_date` (date) columns to `tasks` |
| `src/components/TaskEditDialog.tsx` | Complete rewrite to match NewTaskDialog layout with role-based read-only/editable behavior |

