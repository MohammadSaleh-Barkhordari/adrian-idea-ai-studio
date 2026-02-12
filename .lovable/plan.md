

# Fix Date Block Right Margin in PNG Export

## Change

### File: `src/components/LetterBuilder.tsx` -- `buildCleanLetterDiv` function only

Update the date element's `right` value from `65px` to `100px` to prevent text clipping at the right edge. The `top` stays at `62px`.

**Line ~184** -- Change:
```
right:65px;top:62px;
```
to:
```
right:100px;top:62px;
```

Single character-level edit, nothing else changes.

