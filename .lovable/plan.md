

# Fix: Ensure All Letter Fields Are Saved Correctly

## Problem

The letter creation flow has a gap: when a letter is generated via AI, the fields `mime_type`, `letter_number`, `has_attachment`, `needs_signature`, `needs_stamp`, and `file_path` remain null until the user completes the final LetterBuilder step. If the user leaves before clicking "Generate Final Letter", those fields are never saved.

Additionally, looking at the database, all existing letters show these fields as null -- confirming the issue.

## Root Cause

The flow has 3 steps, and critical fields are only saved at step 3:

1. **WritingLetterPage insert** -- saves recipient info, user_request, user_id, but NOT letter_number, has_attachment, needs_signature, needs_stamp, mime_type, file_path
2. **generate-letter edge function** -- saves only generated_subject, generated_body, status
3. **LetterBuilder final generation** -- saves ALL fields (file_path, mime_type, letter_number, etc.) but only when user clicks the button

## Solution

The LetterBuilder already saves all fields correctly when the user clicks "Generate Final Letter" (lines 316-330). The real fix needed is:

### 1. NewLetterDialog (manual upload) -- Already correct
The insert at line 238-252 already saves `file_path` and `mime_type`. No changes needed.

### 2. LetterBuilder -- Already correct  
The final update at lines 316-330 already saves all fields. No changes needed here either.

### 3. WritingLetterPage initial insert (line 435-451) -- Needs fix
Add default values for `has_attachment`, `needs_signature`, and `needs_stamp` during the initial letter insert so they are never null:

```typescript
const { data: letterData, error: insertError } = await supabase
  .from('letters')
  .insert({
    recipient_name: recipientName,
    recipient_position: recipientPosition || null,
    recipient_company: recipientCompany || null,
    date: date,
    project_id: selectedProject || null,
    document_id: selectedDocument || null,
    user_request: userRequest,
    writer_name: user?.user_metadata?.full_name || user?.email || 'Unknown',
    user_id: user.id,
    customer_id: selectedCustomer || null,
    customer_contact_id: selectedContact || null,
    has_attachment: false,
    needs_signature: false,
    needs_stamp: false,
  })
  .select()
  .single();
```

### 4. Voice-extracted insert (line 250-264) -- Needs same fix
The `handleFieldsExtracted` function also inserts letters without these defaults:

```typescript
const { data: letterData, error } = await supabase
  .from('letters')
  .insert({
    user_id: user.id,
    project_id: selectedProject || null,
    document_id: selectedDocument || null,
    recipient_name: fields.recipientName,
    recipient_position: fields.recipientPosition,
    recipient_company: fields.recipientCompany,
    user_request: fields.userRequest,
    status: 'fields_extracted',
    customer_id: selectedCustomer || null,
    customer_contact_id: selectedContact || null,
    has_attachment: false,
    needs_signature: false,
    needs_stamp: false,
  })
  .select()
  .single();
```

### 5. LetterBuilder preview_generated step (line 243-253) -- Already correct
This intermediate update already saves `has_attachment`, `needs_signature`, `needs_stamp`, and `letter_number`.

## Summary

The fields `mime_type`, `file_path`, and `letter_number` are intentionally null at creation time (they get values only when the final PNG is generated in LetterBuilder). The boolean fields (`has_attachment`, `needs_signature`, `needs_stamp`) have database defaults of `false`, but explicitly setting them in the insert ensures consistency. The two inserts in `WritingLetterPage.tsx` will be updated to include explicit boolean defaults.

## Files to Change

- `src/pages/WritingLetterPage.tsx` -- Add `has_attachment: false`, `needs_signature: false`, `needs_stamp: false` to both letter insert operations (lines ~437 and ~252)

