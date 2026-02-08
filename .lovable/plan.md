

# Fix Project Status Constraint Issue

## Problem Identified

The database has a check constraint that only allows these status values:
- `planning`
- `active`
- `on_hold`
- `completed`
- `cancelled`

But the UI includes `in_progress` as an option, which causes the error:
```
new row for relation "adrian_projects" violates check constraint "adrian_projects_status_check"
```

## Recommended Solution: Add `in_progress` to Database

Since "In Progress" is a common and useful status (distinct from "Active"), I recommend updating the database constraint to allow it.

## Changes Required

### 1. Update Database Constraint

Add `in_progress` to the allowed values in the `adrian_projects_status_check` constraint:

```sql
ALTER TABLE adrian_projects 
DROP CONSTRAINT adrian_projects_status_check;

ALTER TABLE adrian_projects 
ADD CONSTRAINT adrian_projects_status_check 
CHECK (status = ANY (ARRAY['planning', 'active', 'in_progress', 'on_hold', 'completed', 'cancelled']));
```

### 2. Update ProjectsPage.tsx Filter Options

Ensure the filter dropdown in `ProjectsPage.tsx` includes all valid statuses:

| Status Value | Display Label |
|--------------|---------------|
| `planning` | Planning |
| `active` | Active |
| `in_progress` | In Progress |
| `on_hold` | On Hold |
| `completed` | Completed |
| `cancelled` | Cancelled |

### 3. Update Status Display Helpers

Ensure any status color/badge functions handle `in_progress` correctly (already done in recent changes to `ProjectDetailsPage.tsx`).

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add `in_progress` to status constraint |
| `src/pages/ProjectsPage.tsx` | Already has `in_progress` in filter - no changes needed |
| `src/components/ProjectEditDialog.tsx` | Already has `in_progress` option - no changes needed |

## Result

After this change, you will be able to change the IWS project status from "Active" to "In Progress" without any database errors.

