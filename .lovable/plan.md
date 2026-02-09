

# Fix Subject Border in Clean Letter Capture

## Problem

The subject element in `buildCleanLetterDiv()` (line 236) still shows a visible border/box in the generated PNG. While the outer `<div>` and the first `<span>` have border resets, the second `<span>` wrapping the subject text does not. Additionally, `dom-to-image-more` can pick up computed styles, so every child element needs explicit resets.

## Change

**File: `src/components/LetterBuilder.tsx`, line 236**

Update the subject `addEl` call to add explicit style resets on both inner `<span>` elements:

```
Current (line 236):
addEl(baseLong, positions.subject, `<span style="font-weight:bold;border:none;outline:none;background:none;">موضوع: </span><span>${letterData.generatedSubject}</span>`, 'text-align:right;font-size:16px;max-width:580px;');

New:
addEl(baseLong, positions.subject, `<span style="font-weight:bold;border:none;outline:none;background:none;box-shadow:none;">موضوع: </span><span style="border:none;outline:none;background:none;box-shadow:none;">${letterData.generatedSubject}</span>`, 'text-align:right;font-size:16px;max-width:580px;');
```

The key addition is the `style="border:none;outline:none;background:none;box-shadow:none;"` on the second `<span>` that wraps the actual subject text.

## What Does NOT Change

- All other elements in `buildCleanLetterDiv()`
- `generateFinalLetter()` capture logic
- Canvas editing UI, CustomDraggable, LetterTemplate
- Storage, DB updates, download

