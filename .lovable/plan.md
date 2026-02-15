

# Fix: Task Edit Dialog Not Showing Content

## Root Cause

The `TaskEditDialog` is wrapped in a conditional render: `{selectedTask && (<TaskEditDialog .../>)}`. This causes React to mount/unmount the Radix Dialog portal every time `selectedTask` changes. When `loadProjectData` runs (triggered by multiple re-renders from parallel data fetches), it can cause a race condition where React tries to remove portal DOM nodes that have already been moved, producing the crash:

```
Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
```

This crash silently kills the dialog rendering, resulting in a blank overlay.

## Fix

### File: `src/pages/ProjectDetailsPage.tsx`

**Remove the conditional wrapper** around `TaskEditDialog`. Always render the component and let the `open` prop control visibility. Pass `selectedTask` with a fallback so the component always receives a valid prop:

Before:
```tsx
{selectedTask && (
  <TaskEditDialog
    open={taskEditDialogOpen}
    onOpenChange={setTaskEditDialogOpen}
    task={selectedTask}
    ...
  />
)}
```

After:
```tsx
<TaskEditDialog
  open={taskEditDialogOpen}
  onOpenChange={(open) => {
    setTaskEditDialogOpen(open);
    if (!open) setSelectedTask(null);
  }}
  task={selectedTask || {}}
  userRole={userRole || 'general_user'}
  onTaskUpdated={() => {
    if (projectId && user) {
      loadProjectData(projectId, user.id);
    }
  }}
/>
```

### File: `src/components/TaskEditDialog.tsx`

Update the guard at the top to check both `task` and `task.id` before proceeding, so it safely handles the empty object fallback:

```tsx
if (!task || !task.id) return null;
```

This is a one-line change since the component already has `if (!task) return null;` -- just add `|| !task.id`.

## Why This Works

- The Dialog component stays mounted at all times, so portals are never torn down unexpectedly
- The `open` prop cleanly controls visibility without DOM conflicts
- `selectedTask` is cleared on close, not on unmount
- The `task.id` guard prevents any data fetching when no task is selected

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ProjectDetailsPage.tsx` | Remove conditional wrapper around TaskEditDialog, move selectedTask cleanup to onOpenChange |
| `src/components/TaskEditDialog.tsx` | Update guard to `if (!task \|\| !task.id) return null` |

