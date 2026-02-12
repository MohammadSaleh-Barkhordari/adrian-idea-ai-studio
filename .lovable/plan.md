
# Fix: Letter Attachment Storage Path and Display in Sent Emails

## Root Cause

Two issues found:

### 1. Wrong storage path for letters
The letter PNG files are stored in the `Letters` bucket at path `{project_id}/{letter_id}/letter.png` (e.g., `IWS/fc86fe3b-.../letter.png`), but the fallback path in the code constructs `letters/{id}.png` which doesn't exist. This causes the edge function to fail downloading the attachment, so the email is sent **without** the attachment.

### 2. Attachment record not saved on failure
When the download fails, the edge function logs an error but `continue`s, so no attachment is included in the Resend email and no `email_attachments` record is saved. That's why the sent email shows no attachment.

## Fix

### File: `src/components/email/ProjectAttachPicker.tsx`

Update the letter mapping (around line 90) to construct the correct storage path using the project ID:

**Before:**
```typescript
storage_path: d.final_image_url || d.file_url || `letters/${d.id}.png`,
```

**After:**
```typescript
storage_path: d.final_image_url || d.file_url || `${pid}/${d.id}/letter.png`,
```

Where `pid` is the `project_id` already available in scope. This matches the actual storage structure `{project_id}/{letter_id}/letter.png`.

Also add `.png` extension to the filename so the recipient sees a proper file name:

**Before:**
```typescript
name: d.letter_title || d.generated_subject || d.subject || 'Untitled Letter',
```

**After:**
```typescript
name: (d.letter_title || d.generated_subject || d.subject || 'Untitled Letter') + '.png',
```

### No other changes needed
The `send-email` edge function already handles the `Letters` bucket correctly -- the only problem was the wrong path being sent from the frontend.
