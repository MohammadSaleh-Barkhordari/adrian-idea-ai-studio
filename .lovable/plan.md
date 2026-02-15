

# Fix: Task Edit Dialog Still Crashing with removeChild Error

## Root Cause (Deeper)

The previous fix removed the conditional wrapper `{selectedTask && <TaskEditDialog/>}` but introduced `if (!task || !task.id) return null;` inside the component. This still causes the Dialog component to fully unmount when `task` is the empty fallback `{}`, and fully remount when `task` gets a real value. The mount/unmount cycle conflicts with React 18's reconciliation when `loadProjectData` triggers multiple sequential `setState` calls (setDocuments, setLetters, setTasks, setFiles), causing the `removeChild` portal crash.

## Fix

### File: `src/components/TaskEditDialog.tsx`

Remove the early return guard (`if (!task || !task.id) return null;`) and instead control visibility via the Dialog's `open` prop:

```tsx
// REMOVE this line:
if (!task || !task.id) return null;

// CHANGE the Dialog open prop from:
<Dialog open={open} onOpenChange={handleClose}>

// TO:
<Dialog open={open && !!task?.id} onOpenChange={handleClose}>
```

Also guard the `useEffect` to only run when `task.id` exists:

```tsx
useEffect(() => {
  if (open && task?.id) {
    // ... existing initialization code
  }
}, [open, task?.id]);
```

Using `task?.id` as the dependency (instead of `task`) prevents unnecessary re-fires when the `task` object reference changes but the id stays the same.

## Why This Works

- The Dialog component stays mounted at all times (no portal teardown)
- `open && !!task?.id` ensures the dialog only shows when there's a valid task
- The useEffect dependency on `task?.id` (a primitive string) prevents unnecessary re-triggers
- No more DOM conflicts during React's commit phase

## Files Changed

| File | Change |
|------|--------|
| `src/components/TaskEditDialog.tsx` | Remove early return guard, use `open && !!task?.id` on Dialog, stabilize useEffect dependency |

