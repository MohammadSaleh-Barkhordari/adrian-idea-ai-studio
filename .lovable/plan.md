

# Add "Email Letter" Button and Prefill Compose

## Overview

Add a button in the Letter Builder to email the generated letter, and wire EmailPage to open the compose dialog with pre-filled data when navigated to with state.

## Changes

### File 1: `src/components/LetterBuilder.tsx`

**Imports**: Add `useNavigate` from `react-router-dom` and `Mail` from `lucide-react`.

**State**: Add a local variable tracking whether the letter has been generated: check if `letterData.file_url` or a local `letterGenerated` flag is set after `generateFinalLetter` completes.

**New button** (after the Generate button at line 446, before the Log Positions button):

- Label: "ارسال نامه با ایمیل" with Mail icon
- Variant: `outline`
- Disabled when letter has not been generated (`!letterGenerated && !letterData.file_url`)
- Title attribute for tooltip when disabled: "ابتدا نامه را تولید کنید"

**On click handler** (`handleEmailLetter`):
1. Build RTL HTML email body from `letterData` fields (recipientName, recipientPosition, recipientCompany, generatedSubject, generatedBody, writerName)
2. Build plain text version (same content, no HTML)
3. Navigate to `/email` with state:
   ```text
   {
     composeMode: 'new',
     prefill: {
       subject: letterData.generatedSubject,
       body_html: htmlBody,
       body_text: plainText,
       attachments: [{
         name: `Letter-${letterData.recipientName}.png`,
         url: letterData.file_url,
         storage_path: letterData.file_url,
         bucket: 'Letters'
       }]
     }
   }
   ```
   The bucket is `'Letters'` -- matching the upload in `generateFinalLetter` (line 340).

### File 2: `src/pages/EmailPage.tsx`

**Imports**: Add `useLocation` from `react-router-dom`.

**New state**: `prefillData` to hold the compose prefill (subject, body, attachments).

**On mount effect** (after auth check completes):
- Check `location.state?.composeMode === 'new'` and `location.state?.prefill`
- If present:
  1. Store prefill data in state
  2. Set `isComposing = true`, `composeMode = 'new'`
  3. Clear location state: `navigate(location.pathname, { replace: true, state: {} })`

**Pass prefill to EmailCompose**:
- `initialSubject={prefillData?.subject}`
- `initialBody={prefillData?.body_text}`
- `initialBodyHtml={prefillData?.body_html}`
- `initialAttachments={prefillData?.attachments}`

**Clear prefillData** when compose closes (in the `onClose` handler).

## Files Changed

| File | Change |
|------|--------|
| `src/components/LetterBuilder.tsx` | Add `useNavigate`, `Mail` import; add `letterGenerated` state; add "Email Letter" button with handler that builds HTML body and navigates to /email with prefill state |
| `src/pages/EmailPage.tsx` | Add `useLocation`; consume `location.state` prefill on mount; pass prefill props to EmailCompose; clear state after consuming |
