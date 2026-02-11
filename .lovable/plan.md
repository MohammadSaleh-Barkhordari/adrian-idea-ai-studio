

# Migration 2F + 2G: Drop Deprecated Columns and Recreate View

## Migration 2F: Drop Deprecated Columns

### Data check (completed)
- Only 1 employee has `hire_date` set, and it already matches `start_date`. Safe to migrate and drop.
- `emergency_contact` and `contract_url` in `employee_sensitive_data` have no app code references. Safe to drop.

### SQL Migration
```sql
-- Migrate hire_date data (safety net)
UPDATE employees SET start_date = hire_date 
WHERE hire_date IS NOT NULL AND start_date IS NULL;

-- Drop deprecated columns from employees
ALTER TABLE employees DROP COLUMN IF EXISTS email;
ALTER TABLE employees DROP COLUMN IF EXISTS work_email;
ALTER TABLE employees DROP COLUMN IF EXISTS phone;
ALTER TABLE employees DROP COLUMN IF EXISTS hire_date;

-- Drop deprecated columns from employee_sensitive_data
ALTER TABLE employee_sensitive_data DROP COLUMN IF EXISTS emergency_contact;
ALTER TABLE employee_sensitive_data DROP COLUMN IF EXISTS contract_url;
```

### Code changes required BEFORE dropping columns

**EmployeeForm.tsx** -- Remove all references to `email`, `phone`, `hire_date`:

| What | Lines | Change |
|------|-------|--------|
| Interface: remove `hire_date`, `email`, `phone` | 28-30 | Delete these 3 properties |
| Form state: remove `hire_date`, `email`, `phone` | 72-74 | Delete these 3 initial values |
| Data loading: remove `hire_date`, `email`, `phone` | 114-116 | Delete these 3 mappings |
| Save logic: remove `hire_date`, `email`, `phone` from `employeeData` | 187-189 | Delete these 3 fields |
| Contract extraction: remove `hire_date` and `email` mapping | 290, 293 | Delete these lines |
| UI: remove Work Email input | 445-452 | Delete the entire input block |
| UI: remove Hire Date calendar picker | 494-520 | Delete the entire Popover block |
| UI: remove Phone input | 521-528 | Delete the entire input block |

**HRManagementPage.tsx** -- Remove `hire_date`, `email`:

| What | Lines | Change |
|------|-------|--------|
| Interface: remove `hire_date`, `email`, `phone` | 43-45 | Delete these 3 properties |
| Search filter: remove `email` from search | 203 | Remove the `employee.email` clause |
| Table: `hire_date` column display | 614-616 | Replace with `start_date` display (already has a Start Date column at line 527-535, so just remove the duplicate hire_date cell) |
| Table: `employee.email` display under name | 593-597 | Remove this conditional block |

## Migration 2G: Recreate employee_full VIEW

The current view incorrectly aliases `e.status AS employment_type`. It needs to be recreated with all new columns and correct column names.

```sql
CREATE OR REPLACE VIEW public.employee_full 
WITH (security_invoker = true) AS
SELECT 
  p.id as user_id,
  p.email as work_email,
  e.id as employee_id,
  e.name,
  e.surname,
  TRIM(COALESCE(e.name, '') || ' ' || COALESCE(e.surname, '')) as full_name,
  e.name_fa,
  e.surname_fa,
  e.nationality,
  e.job_title,
  e.department,
  e.status,
  e.employment_type,
  e.job_type,
  e.employee_number,
  e.profile_photo_url,
  e.manager_id,
  e.work_location_type,
  e.start_date,
  e.end_date,
  e.probation_end_date,
  e.created_by,
  e.created_at
FROM public.profiles p
LEFT JOIN public.employees e ON e.user_id = p.id;
```

## Execution Order

1. Update `EmployeeForm.tsx` -- remove all `email`, `phone`, `hire_date` references from interface, state, data loading, save logic, contract extraction, and UI elements
2. Update `HRManagementPage.tsx` -- remove `hire_date`, `email`, `phone` from interface, search filter, and table display
3. Run single migration containing both 2F (drop columns) and 2G (recreate view)
4. TypeScript types auto-regenerate

## Summary of UI impact

- The Employment tab loses Work Email, Hire Date, and Phone fields (these are deprecated; work email comes from profiles, phone moves to sensitive data, hire_date is replaced by start_date)
- The employee table loses the `hire_date` column display and the email shown under employee name
- Phase 3 will rebuild the full UI with the new 5-tab structure
