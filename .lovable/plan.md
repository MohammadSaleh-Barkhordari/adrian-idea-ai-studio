

# Fix: "Email Letter" Button Always Disabled

## Problem

The button's disabled condition checks `letterData.file_url`, which is a prop from the parent and never updates after generation. The `generateFinalLetter` function uploads to storage and updates the DB, but the prop stays `undefined`.

## Fix in `src/components/LetterBuilder.tsx`

### 1. Add local state (near existing state declarations)

Add two new state variables:
- `letterGenerated` (boolean, default `false`)
- `generatedFilePath` (string or null, default `null`)

### 2. Set state after successful generation

Inside `generateFinalLetter`, after the successful DB update (around line 346-360), set:
- `setLetterGenerated(true)`
- `setGeneratedFilePath(filePath)` -- where `filePath` is the `{projectName}/{id}/letter.png` string already computed at line 340

### 3. Update button disabled condition (line 489)

Change from:
```
disabled={!letterData.file_url}
```
to:
```
disabled={!letterGenerated && !letterData.file_url}
```

Also update the tooltip condition on the same pattern.

### 4. Update attachment object in email handler (lines 478-483)

Change to use `generatedFilePath`:
```
attachments: [{
  name: `Letter-${letterData.recipientName}.png`,
  url: generatedFilePath || letterData.file_url,
  storage_path: generatedFilePath || letterData.file_url,
  bucket: 'Letters'
}]
```

The bucket is confirmed as `'Letters'` -- matching the `supabase.storage.from('Letters')` call at line 343.

## Files Changed

| File | Change |
|------|--------|
| `src/components/LetterBuilder.tsx` | Add `letterGenerated` + `generatedFilePath` state; set after generation succeeds; fix disabled condition; use `generatedFilePath` in attachment |

