

# Save user_id When Uploading Files

## Problem
When uploading a file in the project details page (via `NewFileDialog`), the `user_id` field in the `files` table is not being set. Only `uploaded_by` is populated.

## Fix

### File: `src/components/NewFileDialog.tsx`

Add `user_id: user.id` to the insert object (alongside `uploaded_by`):

```tsx
const { error: insertError } = await supabase
  .from('files')
  .insert({
    uploaded_by: user.id,
    user_id: user.id,        // <-- add this line
    project_id: projectId,
    file_name: selectedFile.name,
    file_path: uploadData.path,
    file_url: uploadData.path,
    file_size: selectedFile.size,
    file_type: selectedFile.type,
    description: description.trim() || null,
  });
```

This is a one-line addition. Both `uploaded_by` and `user_id` will now store the authenticated user's ID, consistent with how `NewDocumentDialog` handles document uploads.

## Files Changed

| File | Change |
|------|--------|
| `src/components/NewFileDialog.tsx` | Add `user_id: user.id` to the files insert |

