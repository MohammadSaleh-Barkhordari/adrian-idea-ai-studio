

# Fix RTL on Writing Letter Form Inputs

## Issue 1: Form Input Fields

| Element | Line | Current | Fix |
|---------|------|---------|-----|
| recipientName Input | 605 | has `dir="rtl"`, no `text-right` class | Add `className="text-right"` |
| recipientPosition Input | 618 | has `dir="rtl"`, no `text-right` class | Add `className="text-right"` |
| recipientCompany Input | 635 | has `dir="rtl"`, no `text-right` class | Add `className="text-right"` |
| userRequest Textarea | 698 | no `dir="rtl"`, no `text-right` | Add `dir="rtl"` and `text-right` to className |

## Issue 2: Generated Letter Content

The Subject input (line 751) and Body textarea (line 755) already have both `dir="rtl"` and `className="text-right"`. No changes needed here.

## Issue 3: AI Prompt Update

Add Persian typography instruction to the `generate-letter` edge function prompt to ensure proper RTL punctuation ordering.

## File Changes

### `src/pages/WritingLetterPage.tsx` (4 edits)

1. **Line 605** (recipientName): Add `className="text-right"`
2. **Line 618** (recipientPosition): Add `className="text-right"`
3. **Line 635** (recipientCompany): Add `className="text-right"`
4. **Lines 698-704** (userRequest): Add `dir="rtl"` and add `text-right` to className

### `supabase/functions/generate-letter/index.ts` (1 edit)

Add to the prompt's critical requirements section:
```
- Write the letter in proper Persian/Farsi with correct RTL text direction
- Punctuation marks (period, comma, colon) should follow Persian typography rules
```

