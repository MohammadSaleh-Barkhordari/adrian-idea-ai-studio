

# Fix: "Bucket not found" Error on Our Financial Page

## Problem
When saving a financial record with an uploaded file on `/our-financial`, the app fails with `StorageApiError: Bucket not found`. The `Our_Life` storage bucket exists but has no storage access policies, so the storage API denies uploads.

## Solution
Add storage RLS policies to the `Our_Life` bucket so authenticated users can upload, read, and delete files.

## Changes

### Database Migration (single SQL migration)
Add storage policies for the `Our_Life` bucket:
- **INSERT policy**: Allow authenticated users to upload files
- **SELECT policy**: Allow authenticated users to read/download files  
- **DELETE policy**: Allow authenticated users to delete their own files

These policies will be scoped to authenticated users using `auth.role() = 'authenticated'`.

### No code changes needed
The upload logic in `OurFinancialPage.tsx` is correct -- it references `'Our_Life'` which matches the existing bucket name. The only missing piece is the storage policies.

## Technical Details

```text
Storage policies to create on storage.objects:
1. INSERT on bucket_id = 'Our_Life' for authenticated users
2. SELECT on bucket_id = 'Our_Life' for authenticated users  
3. DELETE on bucket_id = 'Our_Life' for authenticated users
```

| Item | Action |
|------|--------|
| Database migration | Add 3 storage policies for `Our_Life` bucket |
| Code changes | None required |

