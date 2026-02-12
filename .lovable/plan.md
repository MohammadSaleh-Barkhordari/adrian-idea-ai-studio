

# Step 2: Apply RTL Alignment to Letter Defaults

## Changes to `src/components/LetterBuilder.tsx`

### 1. Update default positions (lines 36-82)

Replace the current default positions with the new RTL-aligned values:

```javascript
basmala:       { x: 320, y: 245 },  // unchanged
date:          { x: 549, y: 62 },   // updated
recipientName: { x: 506, y: 326 },  // aligned to High X 705
recipientInfo: { x: 577, y: 385 },  // aligned to High X 705
subject:       { x: 331, y: 441 },  // aligned to High X 705
greeting:      { x: 577, y: 502 },  // aligned to High X 705
body:          { x: 129, y: 561 },  // aligned to High X 705
closing1:      { x: 385, y: 766 },  // aligned to High X 705
closing2:      { x: 101, y: 828 },  // unchanged
signature:     { x: 56, y: 933 },   // unchanged
stamp:         { x: 218, y: 933 },  // unchanged
```

### 2. Remove "Log Current Positions" button and function

- Delete the `logCurrentPositions` function (lines 176-215)
- Delete the "Log Current Positions" button (lines 523-526)
- Remove the `Terminal` import from lucide-react (line 10)

### 3. Ensure text-align: right on the 6 aligned boxes in `buildCleanLetterDiv`

The `buildCleanLetterDiv` function (used for PNG generation) already sets `text-align:right` on recipientName, recipientInfo, subject, greeting, body, and closing1. No changes needed there.

The canvas preview elements (JSX) also already have `text-right` and `direction: 'rtl'` on all 6 boxes. No changes needed there either.

## Summary

| Area | Action |
|------|--------|
| Default positions | Update 6 boxes to right-edge align at X=705; update date to (549, 62) |
| Log button/function | Remove entirely |
| RTL text alignment | Already correct, no changes needed |

