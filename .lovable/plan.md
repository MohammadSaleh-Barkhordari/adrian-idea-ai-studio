

# Fix RTL Direction on All Letter Canvas Preview Elements

## Problem

Some text elements in the canvas preview JSX are missing consistent `direction: 'rtl'` and `text-align: right` styling, causing them to render as LTR. The PNG export (`buildCleanLetterDiv`) is correct, but the live preview is inconsistent.

## Elements That Need Updates

| Element | Current | Change Needed |
|---------|---------|---------------|
| basmala (line 472) | `text-center`, has `direction: 'rtl'` | Change `text-center` to `text-right` |
| date (line 481) | Already correct | None |
| recipientName (line 492) | Already correct | None |
| recipientInfo (line 501) | Already correct | None |
| subject (line 513) | Already correct | None |
| greeting (line 523) | Already correct | None |
| body (line 532) | Already correct | None |
| closing1 (line 541) | Already correct | None |
| signature (line 550) | Already correct | None |
| closing2 (line 563) | `text-center`, has `direction: 'rtl'` | Change `text-center` to `text-right` |
| stamp (line 574) | No direction or textAlign | Add `style={{ direction: 'rtl', textAlign: 'right' }}` |

## File Changed

`src/components/LetterBuilder.tsx` -- 3 small edits:

1. **Line 472 (basmala)**: `text-center` to `text-right`
2. **Line 563 (closing2)**: `text-center` to `text-right`
3. **Line 574 (stamp)**: Add `style={{ direction: 'rtl' }}` and `text-right` class

