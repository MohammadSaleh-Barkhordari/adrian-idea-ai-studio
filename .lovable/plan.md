
# Fix: Add `textAlign: 'right'` to Inline Styles on Letter Canvas Elements

## Root Cause

The WritingLetterPage `<main>` container has `dir="ltr"`, which causes CSS inheritance to override the `className="text-right"` on child elements. Most canvas text divs already have `style={{ direction: 'rtl' }}` but are missing `textAlign: 'right'` in the inline style, so the Tailwind `text-right` class gets overridden.

## Changes

### File: `src/components/LetterBuilder.tsx`

Add `textAlign: 'right'` to the inline `style` object on elements that are missing it. Two elements (basmala and closing2) already have it. The rest need it added:

| Element | Line | Current inline style | Fix |
|---------|------|---------------------|-----|
| basmala | 472 | `direction: 'rtl', textAlign: 'right'` | Already correct |
| date | 481 | `direction: 'rtl'` | Add `textAlign: 'right'` |
| recipientName | 492 | `direction: 'rtl'` | Add `textAlign: 'right'` |
| recipientInfo | 501 | `direction: 'rtl'` | Add `textAlign: 'right'` |
| subject | 513 | `direction: 'rtl'` | Add `textAlign: 'right'` |
| greeting | 523 | `direction: 'rtl'` | Add `textAlign: 'right'` |
| body | 532 | `direction: 'rtl'` | Add `textAlign: 'right'` |
| closing1 | 541 | `direction: 'rtl'` | Add `textAlign: 'right'` |
| signature | 550 | `direction: 'rtl'` | Add `textAlign: 'right'` |
| closing2 | 563 | `direction: 'rtl', textAlign: 'right'` | Already correct |
| stamp | 574 | `direction: 'rtl', textAlign: 'right'` | Already correct |

**8 one-line edits** -- each just adds `, textAlign: 'right'` to the existing `style` object. No structural changes.
