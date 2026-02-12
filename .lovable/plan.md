

# Fix Letter PNG Export Positions

## Changes

### File: `src/components/LetterBuilder.tsx` -- `buildCleanLetterDiv` function only

The current `addEl` helper always positions with `left:X; top:Y`. For right-aligned elements, we need `right:X; top:Y` instead. The fix modifies the positioning logic for specific elements.

### Detailed edits (lines 157-201):

**1. Update `addEl` helper** (line 157-162) to accept an optional positioning override, OR replace individual `addEl` calls with direct element creation where positioning differs.

Simpler approach: create a second helper `addElRight` that uses `right` instead of `left`, and update calls accordingly.

**2. Basmala** (line 165): Change from `left`-based positioning to centered:
- Remove `left:320px`
- Add `left:0; width:100%; text-align:center;`
- Keep `top:245px`

**3. Date** (line 174): Switch to right-aligned positioning:
- Use `right:85px; top:120px` (was `left:549px; top:62px`)

**4. recipientName** (line 177): Use `right:85px; top:326px`

**5. recipientInfo** (line 186): Use `right:85px; top:385px`

**6. subject** (line 189): Use `right:85px; top:441px`

**7. greeting** (line 192): Use `right:85px; top:502px`

**8. body** (line 195): Use `right:85px; top:561px`

**9. closing1** (line 198): Use `right:85px; top:766px`

**10. closing2, signature, stamp**: Unchanged (keep left-based positioning)

### Implementation approach

Replace the single `addEl` helper with two versions:
- `addEl(base, pos, html, extra)` -- keep for left-positioned elements (closing2, signature, stamp use this via direct code)
- For right-positioned elements, inline the positioning as `right:85px;top:Ypx;` instead of `left:Xpx;top:Ypx;`
- For basmala, use `left:0;top:245px;width:100%;` for centering

This is ~10 line-level edits within the existing function, no structural changes outside `buildCleanLetterDiv`.
