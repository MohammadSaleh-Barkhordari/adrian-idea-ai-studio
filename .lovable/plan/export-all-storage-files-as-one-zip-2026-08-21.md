# Export all storage files as one ZIP

Download every file stored in the app's file storage and bundle it into a single ZIP.

## What's there now

28 files, about 19 MB total:

- documents — 7 files (~9.8 MB)
- Files — 9 files (~6.7 MB)
- our-life — 10 files (~2.5 MB)
- Letters — 1 file (~0.4 MB)
- customer-logos — 1 file (~0.1 MB)

The other buckets (Contracts, blog-images, email-attachments, employee-documents) are currently empty and will be skipped.

## What you get

- One ZIP with a folder per bucket, keeping each file's original path and name inside it.
- A `README.txt` listing every file with its bucket, path, size, and upload date, plus the export timestamp.

## Notes

- This is file content only — the database rows that reference these files were in the earlier database export.
- Read-only: nothing in the app or storage is changed.

## Technical steps

1. List all objects per bucket from storage.
2. Download each object with the service role via the storage API into `/tmp/storage-export/<bucket>/<path>`.
3. Generate `README.txt` with the file inventory.
4. Zip to `/mnt/documents/storage-export-<date>.zip` and surface it as a downloadable artifact.
5. Verify the file count and total size in the ZIP match the inventory, and confirm no zero-byte downloads.
