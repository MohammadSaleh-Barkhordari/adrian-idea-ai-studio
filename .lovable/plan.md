

# Fix: Letters Table UPDATE RLS + Error Handling

## Problem

The `letters` table has no UPDATE RLS policy for non-admin users. When a regular user clicks "Generate Final Letter":

1. Line 244: `.update({ status: 'preview_generated' ... })` -- silently fails (0 rows matched)
2. Line 311: Storage upload to `Letters` bucket -- this actually works (storage policies exist)
3. Line 316: `.update({ file_path, mime_type, status: 'final_generated' ... })` -- silently fails (0 rows matched)

The storage upload succeeds but the database never gets updated, so `file_path`, `mime_type`, `letter_number`, etc. remain null.

## Storage Bucket Status

The `Letters` bucket already has all 4 policies (INSERT, SELECT, UPDATE, DELETE) for authenticated users. No changes needed here.

## Fix 1: Database Migration -- Add UPDATE RLS Policy

```sql
CREATE POLICY "Creators can update own letters"
  ON public.letters
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## Fix 2: Add Error Handling in LetterBuilder.tsx

Both `.update()` calls (lines 244 and 316) silently discard errors. Changes:

**Line 244-253 (preview_generated update):**
- Capture `{ error }` and log it with `console.error`

**Line 316-330 (final_generated update):**
- Capture `{ error }` and log it
- Show a toast error if the update fails so the user knows something went wrong
- Also handle the upload error case (line 314) -- currently if upload fails, the code just skips silently

**Line 311-313 (storage upload):**
- Add `console.error` for uploadError and show a toast

## Files to Change

- **Database migration** -- Add UPDATE RLS policy for `letters` table
- **`src/components/LetterBuilder.tsx`** -- Add error handling and logging to both `.update()` calls and the storage upload

