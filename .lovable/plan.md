

# Fix: "Associated User is required" Error on Employee Edit

## Root Cause

In `EmployeeForm.tsx`, when editing an employee, the `loadEmployeeData` function is async (it awaits a database query for sensitive data). During this await, `formData` still has its default values including `user_id: ''`. If the user clicks "Update Employee" before the async load completes, the validation at line 170 fails because `formData.user_id` is still empty.

## Fix (single file change)

**File: `src/components/EmployeeForm.tsx`**

1. Add a `dataLoading` state (separate from the submit `loading` state)
2. Set `dataLoading = true` at the start of `loadEmployeeData`, set it to `false` after `setFormData`
3. Disable the Submit button while `dataLoading` is true (show "Loading..." text)
4. As a safety net, in `handleSubmit`, if editing and `formData.user_id` is empty, fall back to `employee.user_id` directly

### Technical Details

```typescript
// Add state
const [dataLoading, setDataLoading] = useState(false);

// In loadEmployeeData:
const loadEmployeeData = async () => {
  if (employee) {
    setDataLoading(true);
    // ... existing fetch code ...
    setFormData({...});
    setDataLoading(false);
  } else {
    generateEmployeeNumber();
  }
};

// In handleSubmit, add fallback:
const userId = formData.user_id || employee?.user_id;
if (!userId) {
  throw new Error('Associated User is required');
}
// Use userId instead of formData.user_id in employeeData

// In the submit button:
<Button type="submit" disabled={loading || dataLoading}>
  {dataLoading ? 'Loading...' : loading ? 'Saving...' : (employee ? 'Update Employee' : 'Create Employee')}
</Button>
```

This is a minimal, safe fix. No database changes. No other files affected.

