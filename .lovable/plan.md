
# Fix: Task Creation Fails - Email Used Instead of UUID

## Problem

The task creation is failing because the **Assigned To** dropdown is storing the user's **email** as the value instead of their **UUID**.

**Database Error:**
```
invalid input syntax for type uuid: "teimourialireza@yahoo.com"
```

**Root Cause:** In `NewTaskDialog.tsx` (line 617), the SelectItem uses `user.email` as the value:
```tsx
<SelectItem key={user.id} value={user.email}>  // ← Bug: email instead of UUID
  {user.email}
</SelectItem>
```

## Solution

Change the `value` prop from `user.email` to `user.id` in all user selection dropdowns within `NewTaskDialog.tsx`.

## Files to Modify

1. `src/components/NewTaskDialog.tsx`

## Detailed Changes

### 1. Fix Assigned To dropdown (line 617)

**Before:**
```tsx
{authUsers.map((user) => (
  <SelectItem key={user.id} value={user.email}>
    {user.email}
  </SelectItem>
))}
```

**After:**
```tsx
{authUsers.map((user) => (
  <SelectItem key={user.id} value={user.id}>
    {user.email}
  </SelectItem>
))}
```

### 2. Fix Follow Up By dropdown (line 636)

**Before:**
```tsx
{authUsers.map((user) => (
  <SelectItem key={user.id} value={user.email}>
    {user.email}
  </SelectItem>
))}
```

**After:**
```tsx
{authUsers.map((user) => (
  <SelectItem key={user.id} value={user.id}>
    {user.email}
  </SelectItem>
))}
```

## Technical Explanation

| Component | Current Behavior | Required Behavior |
|-----------|-----------------|-------------------|
| SelectItem value | `user.email` (string) | `user.id` (UUID) |
| Database column `assigned_to` | Expects UUID | Receives email → Error |

## Expected Outcome

After this fix:
- Task creation will succeed
- The `assigned_to` field will store the correct UUID
- The user will still see email addresses in the dropdown (for readability)
- Notifications will work correctly (already expects UUID)

## Additional Considerations

The code at line 391-399 already expects `formData.assignedTo` to be a UUID:
```tsx
if (formData.assignedTo && formData.assignedTo !== 'unassigned' && formData.assignedTo !== user.id) {
  await sendNotification(
    '📋 New Task Assigned',
    ...
    [formData.assignedTo],  // ← Expects UUID, currently receives email
    ...
  );
}
```

This fix will also make notifications work correctly.
