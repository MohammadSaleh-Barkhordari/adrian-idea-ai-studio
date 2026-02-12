

# Fix: RTL Override for Persian Text Fields on Writing Letter Page

## Root Cause

Line 526 of `WritingLetterPage.tsx` sets `dir="ltr"` on the `<main>` container. This is intentional (internal pages use LTR layout per project conventions), but it overrides the child-level `dir="rtl"` on form inputs. The `dir` HTML attribute alone is not reliably overriding the parent's CSS `direction` inheritance.

## Solution

Add explicit `style={{ direction: 'rtl', textAlign: 'right' }}` to every Persian text input and textarea. This inline style has the highest CSS specificity and will reliably override the parent's LTR direction. Keep `dir="rtl"` as well for semantic correctness.

## Changes

### File: `src/pages/WritingLetterPage.tsx`

**4 form input fields (Issue 1):**

| Field | Fix |
|-------|-----|
| recipientName Input | Add `style={{ direction: 'rtl', textAlign: 'right' }}` |
| recipientPosition Input | Add `style={{ direction: 'rtl', textAlign: 'right' }}` |
| recipientCompany Input | Add `style={{ direction: 'rtl', textAlign: 'right' }}` |
| userRequest Textarea | Add `style={{ direction: 'rtl', textAlign: 'right' }}` |

**2 generated content fields (Issue 2):**

| Field | Fix |
|-------|-----|
| editableSubject Input | Add `style={{ direction: 'rtl', textAlign: 'right' }}` |
| editableBody Textarea | Add `style={{ direction: 'rtl', textAlign: 'right' }}` |

All 6 elements already have `dir="rtl"` and `className="text-right"`. The inline `style` is added as a guaranteed override that cannot be affected by parent `dir="ltr"`.

No other files need changes. The shadcn Input and Textarea components correctly pass through all props including `dir` and `style`.

