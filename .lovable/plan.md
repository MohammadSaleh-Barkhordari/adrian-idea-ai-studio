

# Update recipientInfo Format

## What Changes

Update the recipientInfo text in both the live canvas preview and the PNG export to follow this Persian format:

**"{Recipient Position} محترم شرکت {Recipient Company}"**

For example: "مدیرعامل محترم شرکت ایرانسل"

## Technical Details

### File: `src/components/LetterBuilder.tsx`

**1. PNG Export (`buildCleanLetterDiv`) -- Lines 192-198**

Replace the current dash-separated format with the new Persian format:

```tsx
// Current:
recipientInfoHtml = `${letterData.recipientPosition} - ${letterData.recipientCompany}`;

// New:
recipientInfoHtml = `${letterData.recipientPosition} محترم شرکت ${letterData.recipientCompany}`;
```

Keep the fallback for when only one field is present (show whichever exists).

**2. Live Canvas Preview -- Lines 518-521**

Same format change for the combined display:

```tsx
// Current:
{letterData.recipientPosition} - {letterData.recipientCompany}

// New:
{letterData.recipientPosition} محترم شرکت {letterData.recipientCompany}
```

Two line-level edits, nothing else changes.

