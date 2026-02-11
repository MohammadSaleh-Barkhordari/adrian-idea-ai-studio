

# HR Redesign — Phase 2: Schema Changes

## Reference Audit

### `employment_type` references (OLD meaning = status: active/terminated/on_leave/resigned)

| File | Lines | Usage | Action after rename |
|------|-------|-------|---------------------|
| `src/components/EmployeeForm.tsx` | 27, 71, 113, 186, 289, 476-479 | Form field for active/on_leave/terminated/resigned | Change all to `status` |
| `src/pages/HRManagementPage.tsx` | 42, 206, 338, 511, 515, 606, 618, 624 | Interface type, filter, stats count, table column | Change all to `status` |
| `src/integrations/supabase/types.ts` | multiple | Auto-generated — will regenerate | No manual change needed |
| `employee_full` VIEW | definition | References `e.employment_type` | Recreate view in 2G |
| DB CHECK constraint | `employees_employment_status_check` | On `employment_type` column | Must drop and recreate on `status` column |

### Columns to drop — references (Phase 2F)

| Column | File | Lines | Action |
|--------|------|-------|--------|
| `employees.email` | `EmployeeForm.tsx` | 29, 73, 115, 188 | Remove from form state and save logic |
| `employees.phone` | `EmployeeForm.tsx` | 30, 74, 116, 189 | Remove from form state and save logic |
| `employees.work_email` | `EmployeeForm.tsx` | Not directly used in form | Safe to drop |
| `employees.hire_date` | `EmployeeForm.tsx` | 28, 72, 114, 187, 290, 503, 507, 513 | Remove from form (use start_date instead) |
| `employees.hire_date` | `HRManagementPage.tsx` | 43, 615 | Remove from interface and table display |
| `employee_sensitive_data.emergency_contact` | Not referenced in app code | — | Safe to drop |
| `employee_sensitive_data.contract_url` | Not referenced in app code | — | Safe to drop |
| No edge functions reference any of these columns | — | — | Safe |

## Implementation Plan

### Migration 1: Additive changes (2A + 2C + 2D + 2E) — Safe, no breaking changes

Single migration containing:

**2A — New columns on `employees`:**
- `nationality`, `name_fa`, `surname_fa`, `probation_end_date`, `manager_id` (FK to employees), `work_location_type`, `profile_photo_url`

**2C — New columns on `employee_sensitive_data`:**
- `gender`, `marital_status`, `military_service_status`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`, `contract_type`, `insurance_number`, `insurance_start_date`, `insurance_type`, `tax_id`, `tax_exemption_status`

**2D — New `employee_documents` table:**
- Full table with RLS (admin full access + employee view own), index on `employee_id`, `updated_at` trigger

**2E — Storage bucket `employee-documents`:**
- Private bucket with admin upload/view/delete policies and employee view-own policy (folder-based: `{employee_id}/filename`)

### Migration 2: Rename + constraint (2B) — Requires code updates

1. Drop the existing CHECK constraint `employees_employment_status_check`
2. Rename `employment_type` to `status`
3. Recreate CHECK constraint on `status` column
4. Add new `employment_type` column (nullable, for full_time/part_time/contract/internship)

**Code changes after this migration:**
- `EmployeeForm.tsx`: Replace all `employment_type` references (form state key, default value, save logic, contract extraction) with `status`
- `HRManagementPage.tsx`: Replace `employment_type` in Employee interface, filter logic, stats count, table sort key, and badge display with `status`

### Migration 3: Drop deprecated columns (2F) — After code cleanup

1. Migrate `hire_date` data to `start_date` where needed
2. Drop `email`, `work_email`, `phone`, `hire_date` from `employees`
3. Drop `emergency_contact`, `contract_url` from `employee_sensitive_data`

**Code changes before this migration:**
- `EmployeeForm.tsx`: Remove `email`, `phone`, `hire_date` from form state type, initial state, data loading, and save logic. Remove hire_date calendar picker from UI.
- `HRManagementPage.tsx`: Remove `hire_date` from Employee interface and table column display

### Migration 4: Recreate view (2G)

- Drop and recreate `employee_full` with all new columns (`name_fa`, `surname_fa`, `nationality`, `status`, `employment_type`, `profile_photo_url`, `manager_id`, `work_location_type`, `probation_end_date`)

### Types Regeneration (2H)

- Automatic after migrations complete

## Execution Sequence

1. Run Migration 1 (additive — 2A, 2C, 2D, 2E)
2. **Pause** — confirm success, then proceed
3. Run Migration 2 (rename — 2B)
4. Update `EmployeeForm.tsx` and `HRManagementPage.tsx` for `employment_type` to `status` rename
5. Run Migration 3 (drop columns — 2F)
6. Update `EmployeeForm.tsx` and `HRManagementPage.tsx` to remove dropped column references
7. Run Migration 4 (recreate view — 2G)
8. Types auto-regenerate

Note: No UI redesign in this phase — the form will temporarily lose the hire_date/email/phone fields but those are being moved or deprecated. Phase 3 will rebuild the UI with the new 5-tab structure.

