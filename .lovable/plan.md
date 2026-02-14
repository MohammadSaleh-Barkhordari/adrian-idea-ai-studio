

# Fix: Two Bugs Blocking Letter Generation

## Bug 1: Storage Upload Fails -- Persian Characters in Filename

**Error:** `Invalid key: IWS/934ffaca-.../پیگیری_آخرین_وضعیت_پیشرفت_و_مراحل_اجرایی_پروژه.png`

Supabase Storage does NOT allow Unicode characters (like Persian/Arabic) in file paths. The current regex on line 313 explicitly *allows* Persian characters (`\u0600-\u06FF`), which is the problem.

**Fix:** Remove the Unicode range from the regex so only ASCII-safe characters remain. If the title is entirely Persian (common case), fall back to `"letter"`.

```typescript
// Before (broken):
.replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_')

// After (fixed):
.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^_+|_+$/g, '') || 'letter'
```

## Bug 2: Status Check Constraint Violation

**Error:** `new row for relation "letters" violates check constraint "letters_status_check"`

The constraint only allows: `pending`, `analyzing`, `letter_generated`, `completed`, `error`

But the code tries to set status to `preview_generated` (line 249) and `final_generated` (line 330) -- neither is in the allowed list.

**Fix:** Add `preview_generated`, `final_generated`, and `fields_extracted` to the check constraint via a database migration.

```sql
ALTER TABLE public.letters DROP CONSTRAINT letters_status_check;
ALTER TABLE public.letters ADD CONSTRAINT letters_status_check 
  CHECK (status = ANY (ARRAY[
    'pending', 'analyzing', 'letter_generated', 'completed', 'error',
    'fields_extracted', 'preview_generated', 'final_generated'
  ]));
```

## Files to Change

- **Database migration** -- Update `letters_status_check` constraint to include new status values
- **`src/components/LetterBuilder.tsx`** (line 313) -- Remove Persian/Unicode characters from storage file path

