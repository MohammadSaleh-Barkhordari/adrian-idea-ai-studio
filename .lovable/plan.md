

# Fix: Task Creation Fails — Email Used Instead of UUID for `assigned_by`

## Root Cause

In `NewTaskDialog.tsx` line 143, when the form initializes, it sets:
```typescript
assignedBy: user.email  // "m.barkhordari@adrianidea.ir"
```

This email string is then passed directly to the database insert at line 319:
```typescript
assigned_by: formData.assignedBy || null
```

But `assigned_by` is a UUID column with a foreign key to `profiles`. Postgres rejects the email with error `22P02: invalid input syntax for type uuid`.

## Fix

In `src/components/NewTaskDialog.tsx`, change line 143 from `user.email` to `user.id`:

```typescript
// Before (broken):
assignedBy: user.email

// After (fixed):
assignedBy: user.id
```

The "Assigned By" field in the form (line 605-611) is a free-text Input that displays the value. It currently shows the email which is user-friendly but breaks the DB insert. Two options:

1. **Set the value to `user.id`** and change the Input to a disabled field showing the user's email for display, while storing the UUID internally.
2. **Make the field read-only** with email displayed, but store `user.id` separately for the insert.

The simplest approach: store `user.id` in `formData.assignedBy` and show the email as a disabled display-only input (not bound to `formData.assignedBy`).

## Changes to `src/components/NewTaskDialog.tsx`

1. **Line 143**: Change `assignedBy: user.email` to `assignedBy: user.id`
2. **Lines 605-611**: Change the "Assigned By" Input to show the user's email as display text while keeping the UUID as the stored value. Make it a disabled field showing the email from the auth user.

## Files to Change

- `src/components/NewTaskDialog.tsx` -- Fix assignedBy to use UUID instead of email

