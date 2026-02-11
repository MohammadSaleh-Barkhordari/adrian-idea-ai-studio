

# Fix: Employee Update Errors

## Two bugs found

### Bug 1: "violates check constraint employees_employment_status_check"
The database CHECK constraint on `employment_type` only allows: **active, on_leave, terminated, resigned**.
But the form dropdown offers **"inactive"** which is not in that list. Selecting it causes the save to fail.

**Fix:** Update the form dropdown in `EmployeeForm.tsx` (line 486) to replace `"inactive"` with values matching the constraint. The valid options should be:
- Active
- On Leave
- Terminated
- Resigned

### Bug 2: "duplicate key violates unique constraint employee_sensitive_data_employee_id_key"
When updating an employee, the code uses `.upsert()` for `employee_sensitive_data` but without specifying the conflict column. Since `employee_id` has a unique constraint, the upsert needs to specify `onConflict: 'employee_id'` so it updates the existing row instead of trying to insert a duplicate.

**Fix:** Update the upsert call in `EmployeeForm.tsx` (around line 225) to add the `onConflict` option:
```typescript
.upsert({
  employee_id: employeeId,
  ...sensitiveData
}, { onConflict: 'employee_id' })
```

## Files to change

| File | Change |
|------|--------|
| `src/components/EmployeeForm.tsx` (line 486) | Replace `"inactive"` dropdown option with `"terminated"` and add `"resigned"` |
| `src/components/EmployeeForm.tsx` (line ~225) | Add `{ onConflict: 'employee_id' }` to the `.upsert()` call |

No database changes needed. Single file, two small edits.
