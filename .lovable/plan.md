

# Fix Persian Text Rendering + Auto Letter Number

## 1. Replace html2canvas with dom-to-image-more

**Package changes:**
- Add `dom-to-image-more` to dependencies
- Remove `html2canvas` from dependencies

**In `src/components/LetterBuilder.tsx`:**

- Replace `import html2canvas from 'html2canvas'` with `import domtoimage from 'dom-to-image-more'`

- Add CSS properties to the `#letter-canvas` div (line 328): `fontFeatureSettings: 'normal'` and `textRendering: 'geometricPrecision'` in the style object

- Rewrite the image capture section inside `generateFinalLetter` (lines 177-239):

```text
Old flow:
  html2canvas(element) -> canvas -> canvas.toBlob() -> blob -> upload + download

New flow:
  await document.fonts.ready
  await 500ms delay
  domtoimage.toPng(node, scale options) -> dataUrl -> fetch(dataUrl) -> blob -> upload + download
```

- All post-capture logic stays identical:
  - First DB update (status: preview_generated, has_attachment, needs_signature, needs_stamp, letter_number)
  - Fetch project name from adrian_projects
  - Upload blob to `documents` bucket at `{projectName}/{letterId}/letter.png`
  - Second DB update (status: final_generated, final_generated_at, final_image_url, file_url, mime_type)
  - Browser download with same filename pattern
  - Call onLetterGenerated callback

## 2. Auto-Generate Letter Number (AI-YYMM-NNN)

Add a `useEffect` that runs on component mount:

1. Get current date, compute YYMM (e.g., "2602" for Feb 2026)
2. Compute first day of current month and first day of next month as ISO strings
3. Query: `supabase.from('letters').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth).lt('created_at', startOfNextMonth)`
4. Generate: `AI-${yymm}-${String((count || 0) + 1).padStart(3, '0')}`
5. Set as `letterNumber` state

Update letter canvas date section (line 351) to show `letterNumber || letterData.letter_number` instead of only `letterData.letter_number`.

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Add `dom-to-image-more`, remove `html2canvas` |
| `src/components/LetterBuilder.tsx` | Replace html2canvas with dom-to-image-more; add font wait + CSS; add auto letter number useEffect; update canvas to show auto-generated number |

