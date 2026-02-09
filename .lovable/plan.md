

# Fix Letter PNG Generation -- Clean Off-Screen Render

## Problem

The `generateFinalLetter` function captures `#letter-canvas` which includes all `CustomDraggable` editing UI. Looking at `CustomDraggable.tsx` line 87, each element wraps children in:

```text
border-2 border-dashed border-blue-400 hover:border-blue-600 hover:shadow-md bg-white/90 p-2
```

These blue dashed borders, white backgrounds, and padding all get captured into the final PNG. The current code (lines 204-221) simply captures `document.getElementById('letter-canvas')` with `domtoimage.toPng` -- no cleanup of editing UI.

## Note on RTL Input Fields

The Subject and Body fields in `WritingLetterPage.tsx` (lines 531-550) already have `dir="rtl"` and `className="text-right"`. No change needed there.

## Solution: Build a Clean Off-Screen Div for Capture

### File: `src/components/LetterBuilder.tsx`

Only this file changes.

### 1. Add `buildCleanLetterDiv()` helper function (~80 lines)

Creates a temporary, off-screen DOM element with the letter rendered as plain positioned divs (no drag wrappers):

- Container: `position: fixed; left: -9999px; top: 0; width: 794px; height: 1123px; background: white; overflow: hidden`
- Background: `<img src="/Letter-Template-A4.png">` with `position: absolute; width: 100%; height: 100%`
- All text elements as plain `<div>` with:
  - `position: absolute`, `left` and `top` from `positions` state
  - `direction: rtl`, `text-align: right` (or `center` for basmala and closing2)
  - `white-space: pre-wrap`, `word-wrap: break-word`
  - `font-feature-settings: normal`, `text-rendering: geometricPrecision`
  - `font-family: inherit` (inherits the same Tailwind sans-serif stack used by the canvas)
  - Zero borders, zero padding, zero background -- just text
  - Matching font sizes and weights from the canvas

Element table:

| Element | Position key | Content | Max Width | Align | Font |
|---------|-------------|---------|-----------|-------|------|
| Basmala | positions.basmala | "بسمه تعالی" | auto | center | bold 18px |
| Date block | positions.date | 3 lines: شماره + تاریخ + پیوست | auto | right | 14px |
| Recipient name | positions.recipientName | letterData.recipientName | auto | right | bold 18px |
| Recipient info | positions.recipientInfo | position - company | auto | right | 16px |
| Subject | positions.subject | "موضوع: " + subject | 550px | right | 16px, bold label |
| Greeting | positions.greeting | "با سلام و احترام" | auto | right | medium 16px |
| Body | positions.body | generatedBody | 550px | right | 16px, line-height 1.8 |
| Closing 1 | positions.closing1 | thank you line | auto | right | 16px |
| Closing 2 | positions.closing2 | 3-line sign-off | auto | center | 16px |

- If signature enabled and `signatureUrl` exists: add `<img>` at `positions.signature` (max 192x96px)
- If stamp enabled and `stampUrl` exists: add `<img>` at `positions.stamp` (max 192x192px)
- Returns the container div reference

### 2. Date block order (top to bottom)

```text
Line 1: شماره: {letterNumber || letterData.letter_number}
Line 2: تاریخ: {formatPersianDate(letterData.date)}
Line 3: پیوست: {hasAttachment ? 'دارد' : 'ندارد'}
```

### 3. Modify `generateFinalLetter()` (lines 189-273)

Replace lines 204-221 (the capture section) with:

1. Call `buildCleanLetterDiv()` and append to `document.body`
2. Collect all `<img>` elements inside the clean div
3. Wait for all images to load using `Promise.all` on `img.onload` promises
4. `await document.fonts.ready` + 500ms delay
5. Capture with `domtoimage.toPng()` at 2x scale (width: 1588, height: 2246)
6. Remove the clean div from `document.body`
7. Continue with existing blob conversion (line 223+), upload, DB update, and download -- all unchanged

Everything from line 223 onward stays exactly the same:
- Blob conversion from data URL
- Project name lookup from `adrian_projects`
- Upload to `documents` bucket at `{projectName}/{letterId}/letter.png`
- DB update with `status: 'final_generated'`, `final_generated_at`, `final_image_url`, `file_url`, `mime_type`
- Browser download trigger
- `onLetterGenerated` callback

## What Does NOT Change

- `CustomDraggable.tsx` -- no changes
- `LetterTemplate.tsx` -- no changes
- `WritingLetterPage.tsx` -- no changes (RTL already applied to Subject/Body inputs)
- The editing canvas UI and drag-and-drop functionality
- Preview mode toggle behavior
- Auto letter number generation (useEffect on mount)
- Storage upload path and all DB field updates
- Download trigger and filename pattern

## Files Changed

| File | Change |
|------|--------|
| `src/components/LetterBuilder.tsx` | Add `buildCleanLetterDiv()` helper; replace capture target in `generateFinalLetter` from `#letter-canvas` to clean off-screen div |
