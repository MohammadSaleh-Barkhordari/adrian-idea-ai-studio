

# Phase 1: Backend Foundation — Implementation Plan

## Summary

Phase 1 fixes the backend foundation with zero UI changes. Two sub-phases:
- **1A**: Replace fragile frontend role sync with a database trigger
- **1B**: Slim down `profiles` table, update 3 edge functions, create `employee_full` view

---

## Phase 1A: Database Trigger for Role Sync

### What changes

**1. New migration SQL** — creates trigger function + trigger:
- `sync_job_type_to_user_roles()` function (SECURITY DEFINER)
- `trigger_sync_job_type_to_user_roles` on `employees` table (AFTER INSERT OR UPDATE OF job_type, user_id)
- When `job_type` changes, it DELETEs old roles for that user and INSERTs the new one

**2. Remove frontend sync code from `src/components/EmployeeForm.tsx`**

Lines to remove (the manual role sync blocks):
- Lines 228-258: UPDATE path — the block that deletes old role and upserts new role after employee update
- Lines 280-301: INSERT path — the block that upserts role after new employee creation

After removal, `handleSubmit` will only save to `employees` and `employee_sensitive_data`. The trigger handles `user_roles` automatically.

### Risk
- If the trigger fails silently, user gets no role. Mitigation: the trigger uses simple INSERT, and `job_type` values map directly to `app_role` enum.
- EMP005 has `hire_date` data but null `start_date`. We'll migrate that value in the same migration.

### Test
- Change an employee's job_type from admin to general_user, verify `user_roles` updates
- Create a new employee, verify role appears in `user_roles`

---

## Phase 1B: Profiles Cleanup + employee_full View

### Audit results (what references profiles)

| Location | What it reads | Fix |
|----------|--------------|-----|
| `supabase/functions/send-comment-notification/index.ts` (line 48) | `profiles.full_name, email` | Query `employees` table instead: `name, surname` joined by `user_id` |
| `supabase/functions/send-email/index.ts` (line 63) | `profiles.email` | Keep — `profiles` still has `id` and `email` columns |
| `supabase/functions/receive-email/index.ts` (line 44) | `profiles.id` by email lookup | Keep — `profiles` still has `id` and `email` columns |
| `src/lib/notifications.ts` | `get_user_id_by_email` RPC (queries `profiles.email`) | Keep — RPC function stays, profiles.email stays |
| Frontend (`WritingLetterPage`, `CreateRequestPage`) | `user.user_metadata.full_name` | NOT from profiles table — from auth metadata. No change needed |

**Key finding**: `profiles` table cannot be deleted. It's used by 3 edge functions for email-to-user-id lookups. But `full_name` and `avatar_url` columns are safe to drop — only `send-comment-notification` reads `full_name`, and nothing reads `avatar_url`.

### What changes

**1. Update `supabase/functions/send-comment-notification/index.ts`**

Replace the profiles query (lines 46-53):
```
// BEFORE
const { data: commenter } = await supabase
  .from('profiles')
  .select('full_name, email')
  .eq('id', commenter_id)
  .single();
const commenterName = commenter?.full_name || commenter?.email || 'Someone';

// AFTER  
const { data: commenter } = await supabase
  .from('profiles')
  .select('email')
  .eq('id', commenter_id)
  .single();
const { data: empData } = await supabase
  .from('employees')
  .select('name, surname')
  .eq('user_id', commenter_id)
  .maybeSingle();
const commenterName = empData 
  ? `${empData.name} ${empData.surname}`.trim() 
  : commenter?.email || 'Someone';
```

**2. Migration SQL** — drop columns + simplify trigger + create view:

```text
Step 1: Drop full_name and avatar_url from profiles
Step 2: Replace handle_new_user trigger function (only inserts id + email)
Step 3: Migrate EMP005 hire_date to start_date
Step 4: Create employee_full VIEW with existing columns only
```

The `employee_full` view (Phase 1 version — existing columns only):
```sql
CREATE OR REPLACE VIEW public.employee_full AS
SELECT 
  p.id as user_id,
  p.email as work_email,
  e.id as employee_id,
  e.name,
  e.surname,
  TRIM(COALESCE(e.name, '') || ' ' || COALESCE(e.surname, '')) as full_name,
  e.job_title,
  e.department,
  e.employment_type,
  e.job_type,
  e.employee_number,
  e.start_date,
  e.end_date,
  e.created_by,
  e.created_at
FROM public.profiles p
LEFT JOIN public.employees e ON e.user_id = p.id;
```

### No changes needed for these files
- `supabase/functions/send-email/index.ts` — reads `profiles.email` only (column stays)
- `supabase/functions/receive-email/index.ts` — reads `profiles.id` by email (both stay)
- `src/lib/notifications.ts` — uses `get_user_id_by_email` RPC which queries `profiles.email` (stays)
- All frontend files — they read `user.user_metadata`, not profiles table

---

## Complete File Change List

| File | Change |
|------|--------|
| **Migration SQL** | 1A: Create `sync_job_type_to_user_roles()` function + trigger. 1B: Drop `full_name`/`avatar_url` from profiles, simplify `handle_new_user`, migrate EMP005 hire_date, create `employee_full` view |
| `src/components/EmployeeForm.tsx` | Remove lines 228-258 (update role sync) and lines 280-301 (insert role sync) |
| `supabase/functions/send-comment-notification/index.ts` | Replace profiles.full_name query with employees name+surname lookup |

### What we are NOT changing (Phase 1C boundaries)
- No new columns on any table
- No `employee_documents` table
- No column renames on `employees`
- No column drops from `employees` (email, work_email, phone, hire_date stay for now)
- No form UI changes
- No AI/document edge functions

---

## Implementation Order

1. Run migration SQL (trigger + profiles cleanup + view) — single migration
2. Update `send-comment-notification` edge function
3. Remove manual role sync from `EmployeeForm.tsx`
4. Deploy edge function
5. Test: create employee, change job_type, verify user_roles auto-updates
6. Test: `SELECT * FROM employee_full` returns data with work_email and full_name
7. Test: new user signup still creates profiles row (with only id + email)

