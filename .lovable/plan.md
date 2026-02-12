

# Fix Date Block Position in PNG Export

## Change

### File: `src/components/LetterBuilder.tsx` -- `buildCleanLetterDiv` function only

Update the date element's `addElRight` call to use `top: 62` (restoring original Y) and a custom `right: 65px` instead of the shared `right: 85px`.

Since `addElRight` hardcodes `right:85px`, the date call needs to be switched to a direct element creation (like basmala) to use `right:65px`.

**Current code (approx line 179):**
```tsx
addElRight(baseShort, 120, dateLines.join('<br/>'), 'white-space:normal;text-align:right;font-size:14px;line-height:1.6;');
```

**New code:**
```tsx
const dateEl = document.createElement('div');
dateEl.style.cssText = baseShort + `right:65px;top:62px;white-space:normal;text-align:right;font-size:14px;line-height:1.6;`;
dateEl.innerHTML = dateLines.join('<br/>');
container.appendChild(dateEl);
```

Single line-level edit, no other changes.

