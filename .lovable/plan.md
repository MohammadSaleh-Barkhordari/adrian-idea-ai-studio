

# Fix Letter Data, Storage, and Display

## Problems Found

### 1. Storage Bucket Mismatch
`LetterBuilder.tsx` (line 340) uploads the final PNG to the **`documents`** bucket, but `ProjectDetailsPage.tsx` (line 688) tries to download from the **`Letters`** bucket. This means downloads always fail silently.

**Fix**: Change `LetterBuilder.tsx` to upload to `Letters` bucket instead of `documents`.

### 2. Letter Data Not Fully Saved
When `generateFinalLetter` runs, it updates the DB with `status`, `final_image_url`, `file_url`, and `mime_type` -- but it never saves:
- `letter_title` (always null in DB)
- `generated_subject` (set by edge function, but never updated with the user's edited version)
- `generated_body` (same -- never updated with edits)
- `letter_number` (only set in the `preview_generated` update, but should also be in the final update)

**Fix**: Update the `generateFinalLetter` DB update to also save `letter_title` (use `generatedSubject` as fallback), `generated_subject`, `generated_body`, and `letter_number`.

### 3. Letters Section Shows Wrong Data / Missing Fields
`ProjectDetailsPage.tsx` uses a `Letter` interface (lines 63-79) that references `subject` and `body` columns, but the DB uses `generated_subject` and `generated_body`. So the display always shows empty values. Also, it lacks `letter_title`, `letter_number`, `writer_name`, `has_attachment`, and `final_image_url`.

**Fix**: Update the `Letter` interface and letter card rendering to use correct column names and show richer info (letter number, writer, title).

### 4. Download Uses Wrong Bucket
The download button on `ProjectDetailsPage` uses `supabase.storage.from('Letters')` but the files are currently stored in `documents`. After fix #1, both will use `Letters`, so the download will work.

---

## Detailed Changes

### File 1: `src/components/LetterBuilder.tsx`

**Change A** -- Upload to `Letters` bucket (line 340):
```
Current:  .from('documents')
New:      .from('Letters')
```

**Change B** -- Save complete data in the final DB update (lines 344-353):
Add `letter_title`, `generated_subject`, `generated_body`, and `letter_number` to the update:
```typescript
.update({ 
  status: 'final_generated',
  final_generated_at: new Date().toISOString(),
  final_image_url: filePath,
  file_url: filePath,
  mime_type: 'image/png',
  letter_title: letterData.generatedSubject,
  generated_subject: letterData.generatedSubject,
  generated_body: letterData.generatedBody,
  letter_number: letterNumber || letterData.letter_number || null,
  has_attachment: hasAttachment,
  needs_signature: includeSignature,
  needs_stamp: includeStamp,
  writer_name: letterData.writerName
})
```

### File 2: `src/pages/ProjectDetailsPage.tsx`

**Change A** -- Update `Letter` interface (lines 63-79) to match actual DB columns:
```typescript
interface Letter {
  id: string;
  letter_title?: string;
  letter_number?: string;
  recipient_name?: string;
  recipient_position?: string;
  recipient_company?: string;
  generated_subject?: string;
  generated_body?: string;
  user_request?: string;
  writer_name?: string;
  file_url?: string;
  final_image_url?: string;
  mime_type?: string;
  status: string;
  has_attachment?: boolean;
  project_id?: string;
  document_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
```

**Change B** -- Remove the `final_generated` status filter (line 239). Show all letters regardless of status so users can see in-progress letters too. Add a status badge instead.

**Change C** -- Update the letter card rendering (lines 661-742) to:
- Show `letter_title` or `generated_subject` as the heading (not the old `subject` field)
- Show `letter_number` if present
- Show `writer_name`
- Show `recipient_name` and `recipient_company` as subtitle
- Show status badge (letter_generated, preview_generated, final_generated)
- Download button uses `Letters` bucket (already does -- this will work after Fix #1)
- For `final_generated` letters with `final_image_url`, use that for download path

## What Does NOT Change

- `LetterBuilder.tsx` editing canvas, drag-and-drop, `buildCleanLetterDiv`, capture logic
- `WritingLetterPage.tsx` -- no changes
- `NewLetterDialog.tsx` -- no changes (uploads to `Letters` bucket, different flow)
- Edge function `generate-letter` -- no changes
- DB schema -- no migrations needed, all columns already exist

## Files Changed

| File | Change |
|------|--------|
| `src/components/LetterBuilder.tsx` | Upload to `Letters` bucket; save all letter fields in final DB update |
| `src/pages/ProjectDetailsPage.tsx` | Fix `Letter` interface to match DB columns; remove status filter; update card rendering to show correct fields |
