
# Fix file_path and file_url Across All Upload Components

## The Core Problem

There are two separate issues causing confusion and broken downloads:

1. **file_path vs file_url inconsistency**: Some components store the same storage-relative path in both `file_path` and `file_url`, while others store a full public URL in `file_url`. Downloads break because some download code uses `file_url` as a storage path (expecting `IWS/uuid/file.pdf`) but gets a full URL like `https://...supabase.co/storage/v1/object/public/documents/IWS/uuid/file.pdf`.

2. **Wrong bucket used for downloads**: The ProjectDetailsPage downloads files from bucket `'Documents'` for both documents AND files, but files are uploaded to bucket `'Files'`. This causes download failures for files.

## Current State Per Component

| Component | Bucket | file_path | file_url | Problem |
|-----------|--------|-----------|----------|---------|
| NewDocumentDialog | `documents` | storage path | storage path (same) | Works for download since ProjectDetailsPage uses path with `Documents` bucket |
| NewFileDialog | `Files` | storage path | storage path (same) | Download BROKEN: downloads from `Documents` bucket but file is in `Files` |
| LetterBuilder | `Letters` | n/a | storage path | OK |
| ContractUpload | `documents` | n/a | public URL | Different format from others |
| NewTaskDialog | `Files` | storage path | public URL | Inconsistent -- file_url is public URL |
| TaskEditDialog | `Files` | storage path (implicitly) | public URL | Same inconsistency |
| FinancialAnalysisPage | `documents` | wrong initial path | public URL | file_path set before upload with wrong path |
| OurFinancialPage | `our-life` | wrong initial path | public URL | Same issue |
| CustomerContactForm | `customer-logos` | n/a | public URL | OK (profile photos) |

## The Fix: Standardize Everything

**Rule**: 
- `file_path` = the storage-relative path (what you pass to `.upload()` and `.download()`)
- `file_url` = the storage-relative path (same as file_path -- NOT a public URL)
- Downloads always use the correct bucket matching where the file was uploaded

This means the download code can always do: `supabase.storage.from(correctBucket).download(file_url)`

## Changes Needed

### 1. `src/components/NewFileDialog.tsx`
- `file_path` and `file_url` currently both set to `uploadData.path` (storage path) -- this is correct
- No change needed in upload logic

### 2. `src/pages/ProjectDetailsPage.tsx` -- FIX DOWNLOAD BUCKETS
- Line 828: Documents download from `'Documents'` -- correct
- Line 927: Files download from `'Documents'` -- WRONG, should be `'Files'`

### 3. `src/components/NewTaskDialog.tsx`
- Line 246: `file_url` set to `publicUrl` -- should be `filePath` (storage path)

### 4. `src/components/TaskEditDialog.tsx`
- Line 209: `file_url` set to `publicUrl` -- should be `filePath` (storage path)

### 5. `src/pages/FinancialAnalysisPage.tsx`
- Line 246: Initial `file_path` set to `Financial/${fileName}` before upload -- should be set after upload with real path
- Line 273: `file_url` set to `publicUrl` -- should be set to `filePath` (storage path)

### 6. `src/pages/OurFinancialPage.tsx`
- Line 162: Initial `file_path` set to `OurLife/Financial/${fileName}` -- wrong, should match actual upload path
- Line 189: `file_url` set to `publicUrl` -- should be `filePath` (storage path)
- Note: This uploads to `our-life` bucket but the bucket name is `Our_Life` -- needs verification

### 7. `src/components/ContractUpload.tsx`
- Line 79: Passes `publicUrl` to parent -- but the `documents` bucket is private, so `getPublicUrl` won't work for downloads. Should pass the storage path instead.

### 8. `src/components/CustomerContactForm.tsx`
- Line 127: Uses `contacts/${Date.now()}.${ext}` -- doesn't preserve original filename
- Line 130: Uses public URL -- OK for `customer-logos` since it's a public bucket

### 9. `src/components/email/ProjectAttachPicker.tsx`
- Documents: Uses `file_path` for `storage_path` with bucket `'Documents'` -- correct
- Files: Uses `file_path` for `storage_path` with bucket `'Files'` -- correct
- Letters: Uses `final_image_url || file_url` with bucket `'Letters'` -- correct

## Technical Summary of All Edits

### ProjectDetailsPage.tsx
```
// Line 927: Change bucket from 'Documents' to 'Files' for file downloads
.from('Files')
```

### NewTaskDialog.tsx
```
// Line 246: Use storage path not public URL
file_url: filePath,
```

### TaskEditDialog.tsx
```
// Line 209: Use storage path not public URL  
file_url: filePath,
```

### FinancialAnalysisPage.tsx
```
// Lines 246, 273: Fix file_path and file_url
file_path: filePath,  // set after constructing the real path
file_url: filePath,    // storage path, not public URL
```

### OurFinancialPage.tsx
```
// Lines 162, 174, 176-177, 189: Fix bucket name and paths
// Upload to 'Our_Life' bucket (matching actual bucket name)
// Set file_path and file_url to storage path
```

### ContractUpload.tsx
```
// Line 79: Pass storage path instead of public URL
onFileUploaded(filePath, file.name);
```

### CustomerContactForm.tsx
```
// Line 127: Keep original filename
const fileId = crypto.randomUUID();
const path = `contacts/${fileId}/${file.name}`;
```
