

# Add "Follow Up By Me" Section to Dashboard My Tasks

## Current State
The My Tasks section shows two groups:
1. Tasks Assigned To Me
2. Tasks to Confirm

## Desired Order
1. Tasks Assigned To Me
2. Tasks to Follow Up (where `follow_by` matches current user)
3. Tasks to Confirm

## Changes Required

### File: `src/pages/DashboardPage.tsx`

**1. Update the fetch query (line 123)** to also include `follow_by` in the OR filter:
```
.or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id},follow_by.eq.${user.id},confirm_by.eq.${user.id}`)
```

**2. Update `tasksByRole` categorization (lines 193-198)** to add a `followUpByMe` group:
- `assignedToMe`: tasks where `assigned_to === user.id`
- `followUpByMe`: tasks where `follow_by === user.id` and not already in assignedToMe
- `tasksToConfirm`: tasks where `confirm_by === user.id` and not in the other two groups

**3. Update `filteredAndSortedTasksByRole` (lines 246-249)** to include the new `followUpByMe` group in filtering/sorting.

**4. Update the task count display (line 553)** to include `followUpByMe` count.

**5. Add a new "Tasks to Follow Up" table section** between "Tasks Assigned To Me" and "Tasks to Confirm" (after line 649), with columns: Task Name, Project, Assigned To, Priority, Status, Due Date, Actions.

