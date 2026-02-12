

# Fix Letter Email Integration

Three changes to the email body generated when clicking "ارسال نامه با ایمیل":

## 1. Fix recipientInfo format
Change `${recipientPosition} - ${recipientCompany}` to `${recipientPosition} محترم شرکت ${recipientCompany}` in both the HTML and plain text email bodies.

## 2. Remove subject from email body
Remove the `<p><strong>موضوع: ${subject}</strong></p>` line from the HTML body and the `موضوع: ${subject}` line from the plain text body, since the subject is already in the email's subject field.

## 3. Show sender's Persian name and job title
Currently the closing uses `letterData.writerName` (which is `user_metadata.full_name` -- English) and a hardcoded job title.

### Changes needed:

**WritingLetterPage.tsx:**
- After getting the authenticated user, query the `employees` table for the current user's `name_fa`, `surname_fa`, and `job_title_fa` (matching on `user_id`).
- Pass these as new props: `writerNameFa` and `writerJobTitleFa` to `LetterBuilder`.

**LetterBuilder.tsx:**
- Add `writerNameFa` and `writerJobTitleFa` to the `LetterBuilderProps` interface.
- In the email button handler (lines 419-434), update the closing section:
  - Replace `${letterData.writerName || 'برخورداری'}` with `${letterData.writerNameFa || letterData.writerName}`.
  - Replace the hardcoded `مدیر عامل شرکت آدرین ایده کوشا` with `${letterData.writerJobTitleFa || ''} شرکت آدرین ایده کوشا`.
- Apply the same changes to the plain text version.

## Technical Summary

| File | Change |
|---|---|
| `WritingLetterPage.tsx` | Fetch `name_fa`, `surname_fa`, `job_title_fa` from `employees` for current user; pass to LetterBuilder |
| `LetterBuilder.tsx` (interface) | Add `writerNameFa?: string` and `writerJobTitleFa?: string` |
| `LetterBuilder.tsx` (email handler) | Fix recipientInfo format, remove subject line from body, use Persian name/title in closing |

