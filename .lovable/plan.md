

# Fix Document Download Bucket Case

## Change

In `src/pages/ProjectDetailsPage.tsx`, line 828, change the storage bucket reference from `'Documents'` (wrong case) to `'documents'` (matching the actual bucket ID).

## Technical Detail

```
Line 828: .from('Documents')  -->  .from('documents')
```

This is a one-line fix. The bucket ID is `documents` (lowercase) but the download code uses `Documents` (capital D), causing download failures since bucket IDs are case-sensitive.

