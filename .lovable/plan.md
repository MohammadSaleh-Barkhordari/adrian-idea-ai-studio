
# Letters Table Schema Cleanup

## Summary of Changes

The letters table needs several column-level changes: drop unused columns, rename `file_url` to `file_path`, and ensure all relevant fields are properly saved.

## Current Letters Table Columns to DROP

These 7 columns will be removed:
- `subject` (unused -- `generated_subject` is what gets saved)
- `body` (unused -- `generated_body` is what gets saved)
- `file_url` (being replaced by `file_path`)
- `preview_image_url` (unused/unnecessary)
- `final_image_url` (unused -- `file_url`/`file_path` already stores the final path)
- `preview_generated_at` (unnecessary)
- `final_generated_at` (unnecessary)
- `created_by` (redundant with `user_id`)
- `letter_title` (redundant with `generated_subject`)

## Column to ADD

- `file_path` (text, nullable) -- replaces both `file_url` and `final_image_url`

## Columns That Stay (confirming correctness)

- `letter_number` -- already exists
- `has_attachment` -- already exists (boolean, default false)
- `needs_stamp` -- already exists
- `needs_signature` -- already exists (called `needs_signature`)
- `generated_body` -- already exists (this IS the letter body)
- `generated_subject` -- already exists (this IS the letter subject)
- `mime_type` -- already exists (will always be 'image/png' for generated letters, or the uploaded file's MIME type for manual uploads)

## Database Migration

```sql
ALTER TABLE public.letters DROP COLUMN IF EXISTS subject;
ALTER TABLE public.letters DROP COLUMN IF EXISTS body;
ALTER TABLE public.letters DROP COLUMN IF EXISTS preview_image_url;
ALTER TABLE public.letters DROP COLUMN IF EXISTS final_image_url;
ALTER TABLE public.letters DROP COLUMN IF EXISTS preview_generated_at;
ALTER TABLE public.letters DROP COLUMN IF EXISTS final_generated_at;
ALTER TABLE public.letters DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.letters DROP COLUMN IF EXISTS letter_title;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS file_path text;
```

Then migrate data from `file_url` to `file_path` and drop `file_url`:

```sql
UPDATE public.letters SET file_path = file_url WHERE file_url IS NOT NULL;
ALTER TABLE public.letters DROP COLUMN IF EXISTS file_url;
```

## Code Changes Required

### 1. `src/components/LetterBuilder.tsx`
- Change `final_image_url: filePath` to `file_path: filePath`
- Remove `letter_title` and `final_generated_at` from the update
- Remove `created_by` references if any

### 2. `src/pages/WritingLetterPage.tsx`
- Change `created_by: user.id` to nothing (column dropped; `user_id` already saved)
- Ensure all inserts use valid columns only

### 3. `src/components/NewLetterDialog.tsx`
- Change `file_url: uploadResult.fileUrl` to `file_path: uploadResult.fileUrl`
- Remove `letter_title` from insert

### 4. `src/pages/ProjectDetailsPage.tsx`
- Change `letter.final_image_url || letter.file_url` to `letter.file_path`
- Update letter title display from `letter.letter_title || letter.generated_subject` to just `letter.generated_subject`

### 5. `src/components/email/ProjectAttachPicker.tsx`
- Update select query: remove `subject`, `final_image_url`, `file_url`; add `file_path`
- Update name display: remove `letter_title` and `subject` references
- Update storage_path to use `file_path`

### 6. `src/components/NewTaskDialog.tsx`
- Change `select('id, subject')` to `select('id, generated_subject')`
- Update mapping to use `generated_subject`

### 7. `supabase/functions/create-letter-image/index.ts`
- Replace `preview_image_url`, `final_image_url`, `preview_generated_at`, `final_generated_at` with `file_path` and `status` only

### 8. `supabase/functions/generate-letter/index.ts`
- No changes needed (already uses `generated_subject` and `generated_body`)

### Note on mime_type
For AI-generated letters exported as PNG, `mime_type` is always `image/png`. For manually uploaded letters via NewLetterDialog, it saves the actual file MIME type (could be PDF, etc.). This is correct behavior.
