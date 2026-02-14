

# Fix Documents Table: Save user_id, mime_type, and Remove content Column

## Problem

When uploading a document, the insert in `NewDocumentDialog.tsx` (lines 306-317):
1. Does NOT save `user_id` -- only `uploaded_by` is set
2. Does NOT save `mime_type` -- only `file_type` is set (which stores the same MIME string)
3. The `content` column exists in the table but is never used anywhere in the codebase

## Changes

### 1. Database Migration
Drop the `content` column from the `documents` table since it is unused.

```sql
ALTER TABLE public.documents DROP COLUMN IF EXISTS content;
```

### 2. Code Change: `src/components/NewDocumentDialog.tsx`
Update the `documentData` object (around line 306) to include `user_id` and `mime_type`:

```typescript
const documentData = {
  title: title.trim(),
  project_id: projectId,
  uploaded_by: user.id,
  user_id: user.id,              // ADD THIS
  id: uploadResult.documentId,
  file_path: uploadResult.filePath,
  file_url: uploadResult.filePath,
  file_name: uploadResult.fileName,
  file_size: uploadResult.fileSize,
  file_type: uploadResult.mimeType,
  mime_type: uploadResult.mimeType, // ADD THIS
  summary: content.trim() || null,
};
```

This is a minimal change: two fields added to the insert object, and one column dropped from the database.

