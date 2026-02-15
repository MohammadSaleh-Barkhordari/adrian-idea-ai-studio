
# Show Task Documents, Letters, and Files in Dashboard Action Dialog

## Problem
When clicking the action button on a task in the Dashboard's "My Tasks" section, the `TaskDetailOutcomeDialog` opens but only shows outcome files (uploaded via the outcome section). It does NOT show the documents, letters, or files that were linked to the task when it was created via `NewTaskDialog`. These are stored in the `task_documents`, `task_letters`, and `task_files` join tables.

For requests in "My Requests", there are no action buttons at all, so the user cannot view request details or any associated files.

## Changes

### File: `src/components/TaskDetailOutcomeDialog.tsx`

**1. Add state for task documents and letters:**
- Add `taskDocuments` state (fetched via `task_documents` join table with `documents` table data)
- Add `taskLetters` state (fetched via `task_letters` join table with `letters` table data)

**2. Add fetch functions:**
- `fetchTaskDocuments`: Query `task_documents` joined with `documents` table to get `id, file_name, file_url, file_size, mime_type`
- `fetchTaskLetters`: Query `task_letters` joined with `letters` table to get `id, generated_subject, file_path, letter_number`
- Call both in the `useEffect` when dialog opens

**3. Add download handler:**
- A helper function that downloads from the correct storage bucket based on type:
  - Documents: bucket `documents`, path from `file_url`
  - Letters: bucket `Letters`, path from `file_path`
  - Files: bucket `Files`, path from `file_url`
- Creates a blob URL and triggers browser download

**4. Add read-only display sections in the dialog (before the Outcome section):**
- "Attached Documents" section: list each document with name and download button
- "Attached Letters" section: list each letter with subject/number and download button
- "Attached Files" section: list each file with name, size, and download button
- Each section only appears if there are items to show
- Uses the existing `Card` component pattern for consistency

### File: `src/pages/DashboardPage.tsx`

**5. Add request action buttons:**
- Add an "Actions" column to request tables (Requests To Me, Requests to Confirm, Requests Created By Me)
- Add state for `selectedRequest` and `requestDetailDialogOpen`
- Each request row gets an Edit/View button that opens the request detail

**6. Create a new `RequestDetailDialog` component:**

### New File: `src/components/RequestDetailDialog.tsx`
- A dialog showing request details (description, priority, status, dates, audio playback)
- Shows description audio with signed URL playback if `description_audio_path` exists
- Shows response audio with signed URL playback if `response_audio_path` exists
- Shows response files (from `response_files_path` array) with download buttons
- Read-only view for all fields
- Uses same responsive patterns as TaskDetailOutcomeDialog (`w-[95vw] sm:max-w-[550px]`)

## Technical Details

### Download pattern (matching ProjectDetailsPage):
```tsx
const handleDownload = async (path: string, bucket: string, fileName: string) => {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

### Fetch queries:
```tsx
// Documents
const { data } = await supabase
  .from('task_documents')
  .select('document_id, documents (id, file_name, file_url, file_size, mime_type)')
  .eq('task_id', task.id);

// Letters
const { data } = await supabase
  .from('task_letters')
  .select('letter_id, letters (id, generated_subject, file_path, letter_number)')
  .eq('task_id', task.id);
```

## Summary

| File | Change |
|------|--------|
| `src/components/TaskDetailOutcomeDialog.tsx` | Fetch and display task documents, letters, and files with download buttons |
| `src/components/RequestDetailDialog.tsx` | New dialog for viewing request details and downloading response files |
| `src/pages/DashboardPage.tsx` | Add action buttons to request tables, wire up RequestDetailDialog |
