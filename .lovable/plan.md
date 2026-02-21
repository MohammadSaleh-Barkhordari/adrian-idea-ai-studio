
# Fix Storage Upload Failure for Sattari on Our Financial Page

## Root Cause

The `our-life` storage bucket has `allowed_mime_types` restrictions (`[image/png, image/jpeg, image/gif, image/webp, application/pdf]`) and a 50MB `file_size_limit`. In contrast, the `Files` bucket (where Sattari has successfully uploaded files) has NO such restrictions.

On certain devices/browsers, the `File` object's MIME type can be reported differently (e.g., empty string, or a variant like `image/x-png`), causing the bucket to reject the upload even though the file is a valid PNG. This explains why Barkhordari's uploads work (his browser reports the type correctly) while Sattari's fail.

Evidence:
- Sattari's document record IS created in the `documents` table (DB insert works)
- But NO files from Sattari exist in the `our-life` storage bucket (upload fails)
- Sattari HAS successfully uploaded to the `Files` bucket (which has no mime type restrictions)
- The upload failure causes the entire save to abort, so no `our_financial` record is created either

## Changes

### 1. Database Migration -- Remove Bucket Restrictions

Remove `allowed_mime_types` and `file_size_limit` from the `our-life` bucket to match the `Files` bucket behavior. The frontend already validates file types before upload, so the bucket-level restriction is redundant and causes cross-browser compatibility issues.

```sql
UPDATE storage.buckets 
SET allowed_mime_types = NULL, file_size_limit = NULL 
WHERE id = 'our-life';
```

### 2. Code Fix -- `src/pages/OurFinancialPage.tsx`

**a) Explicitly set `contentType` during storage upload** (line 177-179):

Add `contentType` option to the `.upload()` call to avoid relying on browser MIME type detection:

```typescript
const { error: uploadError } = await supabase.storage
  .from('our-life')
  .upload(filePath, uploadedFileInfo.file, {
    contentType: uploadedFileInfo.fileType || 'application/octet-stream'
  });
```

**b) Make the save resilient** -- Separate the file upload from the financial record creation so that a storage failure does not prevent saving the core financial data. If the upload fails, still save the financial record and show a warning about the attachment.

**c) Clean up orphaned document records** -- Delete Sattari's orphaned document record (has empty file_path, no corresponding storage file):

```sql
DELETE FROM documents 
WHERE uploaded_by = '8dd0bb2f-2768-4c1c-9e62-495f36b882d4' 
AND project_id = 'our-life' 
AND file_path = '';
```

## Summary

| Item | Change |
|------|--------|
| `our-life` bucket config | Remove `allowed_mime_types` and `file_size_limit` restrictions |
| `OurFinancialPage.tsx` line 177-179 | Explicitly pass `contentType` to storage upload |
| `OurFinancialPage.tsx` save function | Make upload failure non-blocking for financial record creation |
| Data cleanup | Delete orphaned document record from Sattari |
