

# Fix: Set RTL on Letter Canvas Container

## Root Cause

The DOM hierarchy has **3 intermediate wrapper divs** (from CustomDraggable) between `<main dir="ltr">` and the content divs. While inline `style={{ direction: 'rtl' }}` on the innermost content should theoretically work, setting RTL at the canvas level is the correct architectural fix since the entire letter is Persian.

## The Fix

### File: `src/components/LetterBuilder.tsx` (1 edit)

**Line 459** -- Add `dir="rtl"` and `style` update to the `letter-canvas` container:

```tsx
// Before:
<div id="letter-canvas" className="relative border-2 border-gray-300 bg-white shadow-xl overflow-hidden flex-shrink-0" style={{
  width: '794px',
  height: '1123px',

// After:
<div id="letter-canvas" dir="rtl" className="relative border-2 border-gray-300 bg-white shadow-xl overflow-hidden flex-shrink-0" style={{
  direction: 'rtl',
  width: '794px',
  height: '1123px',
```

This single change makes all child elements (including the 3 CustomDraggable wrapper divs) inherit RTL direction by default. The existing inline `textAlign: 'right'` on individual content divs will then work correctly since they no longer fight against an inherited LTR direction.

No other files need changes. The individual `direction: 'rtl'` and `textAlign: 'right'` styles already added to content divs remain as reinforcement.

