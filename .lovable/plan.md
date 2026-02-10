

# Email Attachment Support

## Overview

Add file attachment support to the email system: compose with attachments, send them via Resend, and display them when viewing emails.

## Changes

### 1. Edge Function: `supabase/functions/send-email/index.ts`

- Accept optional `attachments` field in request body: `Array<{ filename: string, storage_path: string, bucket?: string }>`
- Create a service-role Supabase client using `SUPABASE_SERVICE_ROLE_KEY` (already configured as a secret)
- For each attachment, download from storage, convert to base64, add to Resend API payload
- After successful send, insert records into `email_attachments` table (columns: `email_id`, `file_name`, `file_size`, `content_type`, `storage_path`)

### 2. `src/components/email/EmailCompose.tsx`

**New optional props:**
- `initialSubject?: string`
- `initialBody?: string`
- `initialBodyHtml?: string`
- `initialAttachments?: Array<{ name: string, url: string, storage_path: string, bucket?: string }>`

**Attachment UI (below body textarea):**
- "Attach File" button with Paperclip icon
- Hidden file input accepting `.png, .jpg, .jpeg, .pdf` (max 10MB)
- Attachment list showing filename, formatted size, and remove button
- Pre-loaded attachments from `initialAttachments` shown on mount
- Two state arrays: `fileAttachments` (new files from picker) and `preloadedAttachments` (from props)

**Updated send flow:**
1. Upload new file attachments to `email-attachments` bucket at `{userId}/{timestamp}-{filename}`
2. Combine uploaded paths with pre-loaded attachments
3. Pass combined `attachments` array to the edge function

**Initial values logic:**
- Only apply `initialSubject`/`initialBody` when `mode === 'new'` and no `replyToEmail` -- so reply/forward prefill is not overridden

### 3. `src/components/email/EmailDetail.tsx`

- Add state for `attachments` array
- When fetching an email, also query `email_attachments` where `email_id` matches
- If attachments exist, render an "Attachments" section between body and thread:
  - Each attachment: Paperclip icon, filename, file size, Download button
  - Download creates a signed URL from `email-attachments` bucket and opens in new tab

## No Database Migrations Needed

The `email_attachments` table already exists with the right schema (`id`, `email_id`, `file_name`, `file_size`, `content_type`, `storage_path`, `created_at`). The `email-attachments` storage bucket also exists with RLS policies.

## Technical Details

### Base64 conversion in edge function

```text
const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

for (const att of attachments) {
  const { data } = await serviceClient.storage
    .from(att.bucket || 'email-attachments')
    .download(att.storage_path);
  if (data) {
    const arrayBuffer = await data.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    resendAttachments.push({ filename: att.filename, content: base64 });
  }
}
```

### File size formatting helper in EmailCompose

```text
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
```

### EmailPage does NOT change in this step

The `initialSubject`/`initialBody`/`initialAttachments` props are added to EmailCompose but not yet wired from EmailPage -- that will happen in the "Email Letter" feature (Part 2). For now, EmailPage continues to use EmailCompose as before, and the new props simply default to undefined.

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/send-email/index.ts` | Add service-role client, download attachments from storage, base64 encode, pass to Resend, save to email_attachments |
| `src/components/email/EmailCompose.tsx` | Add Paperclip import, attachment state, file picker UI, upload-before-send logic, new optional props |
| `src/components/email/EmailDetail.tsx` | Query email_attachments on load, render attachments section with download buttons |

