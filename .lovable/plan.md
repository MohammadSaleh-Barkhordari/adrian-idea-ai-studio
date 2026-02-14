

# Fix Status Label: "Done" to "Completed"

## Change

In `src/components/TaskDetailOutcomeDialog.tsx`, line 406, change the display label of the status option from "Done" to "Completed". The underlying value (`completed`) stays the same since it matches the database constraint.

**Before:**
```
<SelectItem value="completed">Done</SelectItem>
```

**After:**
```
<SelectItem value="completed">Completed</SelectItem>
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/TaskDetailOutcomeDialog.tsx` | Change label from "Done" to "Completed" (line 406) |

