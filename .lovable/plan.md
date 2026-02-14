

# Reorganize Dashboard Sections

## Overview

Remove the "Tasks Created By Me" section and add confirmation sections for both tasks and requests.

## New Section Order

**My Tasks:**
1. Tasks Assigned To Me (existing)
2. Tasks to Confirm (new -- tasks where `confirm_by` matches current user)

**My Requests:**
1. Requests To Me (existing)
2. Requests to Confirm (new -- requests where `confirm_by` matches current user)

## Changes in `src/pages/DashboardPage.tsx`

### 1. Update task fetch query

Current query fetches tasks where `assigned_to` or `assigned_by` matches user. Update to also fetch tasks where `confirm_by` matches user ID:

```
.or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id},confirm_by.eq.${user.id}`)
```

### 2. Update request fetch query

Current query fetches requests where `user_id` or `request_to` matches user. Update to also fetch where `confirm_by` matches:

```
.or(`user_id.eq.${user.id},request_to.eq.${user.id},confirm_by.eq.${user.id}`)
```

### 3. Update task categorization (`tasksByRole` memo)

- Remove `assignedByMe` category
- Add `tasksToConfirm`: tasks where `confirm_by === user.id` (excluding duplicates already in assignedToMe)

### 4. Update request categorization (`requestsByRole` memo)

- Add `requestsToConfirm`: requests where `confirm_by === user.id`

### 5. Update filtered/sorted memos

- Remove `assignedByMe` from `filteredAndSortedTasksByRole`
- Add `tasksToConfirm` to `filteredAndSortedTasksByRole`
- Add `requestsToConfirm` to `filteredAndSortedRequestsByRole`

### 6. Update task count display

Change the count in the filter card from referencing `assignedByMe` to `tasksToConfirm`.

### 7. Remove "Tasks Created By Me" table (lines 587-647)

Delete the entire card rendering `assignedByMe` tasks.

### 8. Add "Tasks to Confirm" table

New card after "Tasks Assigned To Me" with columns: Task Name, Project, Assigned To, Priority, Status, Due Date, Actions. Same row rendering pattern as existing tables.

### 9. Add "Requests to Confirm" table

New card after "Requests To Me" with columns: Request By, Description, Priority, Status, Due Date, Created At. Same row rendering pattern.

### 10. Update empty state checks

Update the "no tasks found" and "no requests found" conditions to reference the new categories instead of the removed ones.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/DashboardPage.tsx` | Remove "Tasks Created By Me", add "Tasks to Confirm" and "Requests to Confirm" sections, update fetch queries and categorization logic |

