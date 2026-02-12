
# Fix: Letters Not Appearing in Project Attach Picker

## Problem Found

After investigating the database, I found two issues preventing letters from showing up:

1. **Wrong status filter**: The code filters for `status = 'final_generated'`, but all your letters have status `letter_generated`. The final PNG generation step was never completed for these letters, so none match.
2. **Missing `final_image_url`**: The code requires `final_image_url` to be set, but it's null for all letters. Since the final step wasn't completed, no PNG path was saved to the database.
3. **Missing display name**: `letter_title` and `subject` are both null, but `generated_subject` has the actual Persian subject text.

## Fix

### File: `src/components/email/ProjectAttachPicker.tsx`

Update the letter query (lines 82-93) to:

- **Remove the status filter** -- show all letters for the project regardless of status (or filter for `letter_generated` as well)
- **Also select `generated_subject` and `file_url`** -- since `letter_title` and `subject` are null, use `generated_subject` for the display name
- **Use `file_url` as fallback** for `final_image_url` -- if `final_image_url` is null, try `file_url`
- **If neither URL exists**, still show the letter in the list but construct the expected storage path from the letter ID (e.g., `letters/{id}.png`) since the PNG files may exist in storage even though the URL wasn't saved to the database

The updated query will look like:
```typescript
const { data } = await supabase
  .from('letters')
  .select('id, letter_title, subject, generated_subject, final_image_url, file_url')
  .eq('project_id', pid)
  .order('created_at', { ascending: false });

setItems((data || []).map(d => ({
  id: d.id,
  name: d.letter_title || d.generated_subject || d.subject || 'Untitled Letter',
  storage_path: d.final_image_url || d.file_url || `letters/${d.id}.png`,
  bucket: 'Letters',
})));
```

This single change will make all your letters visible in the picker with their Persian subject as the display name.
