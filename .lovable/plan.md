

# Fix: Auto-Create User Role When Adding Employee

## Problem

When a new employee is created via the HR Management form, the `job_type` field (admin/general_user) is saved to the `employees` table but **not** synchronized to the `user_roles` table. This means the user won't have proper access permissions until manually assigned via Role Management.

## Current Data Flow

```text
Employee Form
     │
     ├──► employees table (job_type saved here)
     │
     └──► employee_sensitive_data table
     
     ✗ user_roles table NOT updated
```

## Solution

Modify the `EmployeeForm.tsx` to automatically insert/update a role in `user_roles` when creating or updating an employee, based on the selected `job_type`.

## Implementation

### Option A: Application-Level (Recommended)

Update `src/components/EmployeeForm.tsx` to add user role logic in the `handleSubmit` function:

**After line 246** (after sensitive data insert), add:

```typescript
// Create user role based on job_type
const roleToAssign = formData.job_type === 'admin' ? 'admin' : 'general_user';

const { error: roleError } = await supabase
  .from('user_roles')
  .upsert({
    user_id: formData.user_id,
    role: roleToAssign,
  }, {
    onConflict: 'user_id,role'
  });

if (roleError) {
  console.error('Error assigning role:', roleError);
  // Don't throw - employee was created successfully
  toast({
    title: "Warning",
    description: "Employee created but role assignment failed. Please assign role manually.",
    variant: "destructive",
  });
}
```

**For updates** (after line 226), add similar logic to update the role when job_type changes.

### Option B: Database Trigger (Alternative)

Create a database trigger that automatically creates a user role when an employee is inserted:

```sql
CREATE OR REPLACE FUNCTION sync_employee_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Map job_type to app_role enum
  IF NEW.job_type = 'admin' THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.job_type = 'general_user' THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.user_id, 'general_user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_employee_role_trigger
AFTER INSERT OR UPDATE OF job_type ON employees
FOR EACH ROW
EXECUTE FUNCTION sync_employee_role();
```

## My Recommendation

**Option A (Application-Level)** is recommended because:
- Provides immediate user feedback if role assignment fails
- Easier to debug and maintain
- Allows for more complex logic (e.g., removing old roles when job_type changes)

## Files to Modify

1. `src/components/EmployeeForm.tsx`
   - Add role upsert logic after employee creation (new employees)
   - Add role update logic after employee update (existing employees)
   - Handle edge case: when job_type changes from admin to general_user, update the role

## Additional Consideration

When **updating** an employee's job_type, we should:
1. Delete the old role if job_type changed
2. Insert the new role

This ensures users don't accumulate multiple roles unintentionally.

## Fix for Existing Data

For the new employee "Ramin Pishali" (user_id: `88514d79-a78c-49fe-a9a8-112fa783c2ec`), you can manually add the role by going to Role Management in HR Management and assigning the "Admin" role.

Or I can execute a one-time fix:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('88514d79-a78c-49fe-a9a8-112fa783c2ec', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

