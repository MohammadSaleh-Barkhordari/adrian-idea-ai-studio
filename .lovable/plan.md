

# Fix Text Wrapping and Border Issues in Clean Letter Capture

## Problem

In `buildCleanLetterDiv()`, the `baseTextStyle` uses `white-space: pre-wrap` for ALL elements, causing short Persian text to wrap into multiple lines. Additionally, subject and signature elements still show visible borders.

## Changes to `src/components/LetterBuilder.tsx`

Only this file changes.

### 1. Split baseTextStyle into two variants

Replace the single `baseTextStyle` (line 201) with two style constants:

- **`baseShortTextStyle`**: Same as current but with `white-space: nowrap` instead of `white-space: pre-wrap`, and without `word-wrap: break-word`
- **`baseLongTextStyle`**: Keeps `white-space: pre-wrap; word-wrap: break-word` for Subject and Body only

Both share: `position:absolute; direction:rtl; font-feature-settings:normal; text-rendering:geometricPrecision; font-family:inherit; color:#000; margin:0; padding:0; border:none; outline:none; background:none; box-shadow:none;`

### 2. Apply nowrap to short text elements

Update each `addTextEl` call to use the correct base style:

| Element | Style Base | Extra Changes |
|---------|-----------|---------------|
| Basmala (line 211) | Short (nowrap) | No change to extra |
| Date block (line 220) | Short (nowrap) | Keep line-height:1.6, but use `white-space:normal` since it has `<br/>` tags |
| Recipient name (line 223) | Short (nowrap) | No change |
| Recipient info (line 232) | Short (nowrap) | Use `white-space:normal` if it contains `<br/>` |
| Subject (line 235) | Long (pre-wrap) | Change max-width from 550px to 580px |
| Greeting (line 238) | Short (nowrap) | No change |
| Body (line 241) | Long (pre-wrap) | Change max-width from 550px to 580px |
| Closing 1 (line 244) | Short (nowrap) | No change |
| Closing 2 (line 247) | Short (nowrap) | Use `white-space:normal` since it has `<br/>` tags for its 3 lines |

### 3. Fix signature image border

Update the signature `<img>` style (line 254) to add `border:none;outline:none;background:transparent;` to its cssText.

### 4. Fix stamp image border

Update the stamp `<img>` style (line 263) to add `border:none;outline:none;background:transparent;` to its cssText.

## Technical Details

The `addTextEl` helper function signature stays the same. The change is:

**Current baseTextStyle (line 201):**
```text
position:absolute;direction:rtl;white-space:pre-wrap;word-wrap:break-word;font-feature-settings:normal;text-rendering:geometricPrecision;font-family:inherit;color:#000;margin:0;padding:0;border:none;background:none;
```

**New approach -- two base styles plus explicit border/outline/box-shadow reset:**

Short text base:
```text
position:absolute;direction:rtl;white-space:nowrap;font-feature-settings:normal;text-rendering:geometricPrecision;font-family:inherit;color:#000;margin:0;padding:0;border:none;outline:none;background:none;box-shadow:none;
```

Long text base:
```text
position:absolute;direction:rtl;white-space:pre-wrap;word-wrap:break-word;font-feature-settings:normal;text-rendering:geometricPrecision;font-family:inherit;color:#000;margin:0;padding:0;border:none;outline:none;background:none;box-shadow:none;
```

For date block and closing2 which use `<br/>` for line breaks, override with `white-space:normal` in the extra parameter so `<br/>` tags work while still not constraining width.

## What Does NOT Change

- `generateFinalLetter()` capture logic -- unchanged
- Canvas editing UI -- unchanged
- CustomDraggable.tsx, LetterTemplate.tsx, WritingLetterPage.tsx -- unchanged
- Storage, DB updates, download -- unchanged

## Files Changed

| File | Change |
|------|--------|
| `src/components/LetterBuilder.tsx` | Split baseTextStyle into short/long variants; add nowrap to short elements; add border/outline/box-shadow reset to all elements and images; increase body/subject max-width to 580px |

