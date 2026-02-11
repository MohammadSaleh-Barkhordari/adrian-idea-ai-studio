

# Migration 2B: Rename employment_type to status + Code Updates

## Step 1: Database Migration

Run a single migration that:
1. Drops the existing CHECK constraint `employees_employment_status_check` on `employment_type`
2. Renames the `employment_type` column to `status`
3. Recreates the CHECK constraint on `status` with the same allowed values (active, on_leave, terminated, resigned)
4. Adds a new nullable `employment_type` column (for future values: full_time, part_time, contract, internship)

## Step 2: Code Updates

### EmployeeForm.tsx (7 changes)

| Line | Current | New |
|------|---------|-----|
| 27 | `employment_type: string;` | `status: string;` |
| 71 | `employment_type: 'active',` | `status: 'active',` |
| 113 | `employment_type: employee.employment_type \|\| 'active',` | `status: (employee as any).status \|\| 'active',` |
| 186 | `employment_type: formData.employment_type,` | `status: formData.status,` |
| 289 | `employment_type: contractData.employmentType \|\| prev.employment_type,` | `status: contractData.employmentType \|\| prev.status,` |
| 474-478 | Label "Employment Status" with `formData.employment_type` and onChange setting `employment_type` | Same label, change all refs to `status` |

### HRManagementPage.tsx (7 changes)

| Line | Current | New |
|------|---------|-----|
| 42 | `employment_type: string;` | `status: string;` |
| 206 | `employee.employment_type === employmentTypeFilter` | `employee.status === employmentTypeFilter` |
| 338 | `emp.employment_type === 'active'` | `emp.status === 'active'` |
| 408-419 | Filter dropdown uses `employmentTypeFilter` -- this filter currently shows full_time/part_time/contractor/intern values which are WRONG for status. Change to show active/on_leave/terminated/resigned | Update filter options to match status values |
| 511, 515 | `handleSort('employment_type')` and `getSortIcon('employment_type')` | `handleSort('status')` and `getSortIcon('status')` |
| 606 | `employee.employment_type.replace('_', ' ')` | `employee.status.replace('_', ' ')` |
| 618, 624 | `employee.employment_type === 'active'` and `employee.employment_type` | `employee.status === 'active'` and `employee.status` |

## Technical Notes

- The `employmentTypeFilter` state variable name stays as-is (it's a UI state, will be redesigned in Phase 3). Only the comparison target changes from `employment_type` to `status`.
- The filter dropdown options on HRManagementPage (lines 413-418) currently show full_time/part_time/contractor/intern which are wrong -- they should show active/on_leave/terminated/resigned to match the actual column values. This will be corrected.
- The Employee interface `employment_type` field in both files is renamed to `status`.
- TypeScript types will auto-regenerate after the migration.

