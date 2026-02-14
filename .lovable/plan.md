

# Fix Bucket Case Mismatch in ProjectAttachPicker

## Problem

The `ProjectAttachPicker.tsx` component uses `'Documents'` (capital D) as the bucket name when mapping document attachments. The actual bucket ID is `'documents'` (lowercase). This causes the `send-email` edge function to fail when downloading the attachment because `supabase.storage.from('Documents')` doesn't match the real bucket.

## Audit Results

| Current Value | Correct Bucket ID | Status |
|---|---|---|
| `'Documents'` | `'documents'` | WRONG |
| `'Files'` | `'Files'` | OK |
| `'Letters'` | `'Letters'` | OK |

## Fix

### `src/components/email/ProjectAttachPicker.tsx`

**Line 62**: Change `bucket: 'Documents'` to `bucket: 'documents'`

This is a one-character fix (lowercase 'd'). The other two bucket references (`'Files'` and `'Letters'`) are already correct.

