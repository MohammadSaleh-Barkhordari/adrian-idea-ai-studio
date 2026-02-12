

# Split Honorific into Gender + Title

## Overview

Split the single `honorific_fa` dropdown into two separate fields:
- **Gender** (جنسیت): `جناب آقای` / `سرکار خانم`
- **Title** (عنوان): `دکتر` / `مهندس` / `حجت‌الاسلام`

These combine in letters as: **"جناب آقای دکتر کریمی"** (gender + title + last name).

## Database Migration

Add a new column for the professional title, repurpose `honorific_fa` for gender only:

```sql
ALTER TABLE customer_contacts ADD COLUMN IF NOT EXISTS title_fa text;
```

No need to rename `honorific_fa` -- it stays but its usage changes to gender-only values. Existing data with old values (e.g., `دکتر` stored in `honorific_fa`) will need to be handled in the form's loading logic.

## Changes to `CustomerContactForm.tsx`

### Form State
- Add `title_fa: ''` to form state
- Keep `honorific_fa` for gender

### Dropdown Changes

Replace the single Honorific dropdown with two:

**Gender (FA)** -- Select dropdown:
- `جناب آقای`
- `سرکار خانم`

**Title (FA)** -- Select dropdown:
- (empty / none)
- `دکتر`
- `مهندس`
- `حجت‌الاسلام`
- `Custom...` (with text input fallback)

Layout:
```text
Row: Gender (FA) dropdown | Title (FA) dropdown
```

### Loading Logic (useEffect)

When editing an existing contact, detect if the old `honorific_fa` value contains a title value (`دکتر`, `مهندس`, `حجت‌الاسلام`) and migrate it to the `title_fa` field in the form. This handles backward compatibility with contacts saved before the split.

### Submit Payload

- `honorific_fa` saves the gender value (or null)
- `title_fa` saves the professional title (or null)

### Remove Custom Honorific

The `honorificCustom` / `honorificCustomValue` state moves to the Title field instead, since gender options are fixed but professional titles could be custom.

## Changes to `WritingLetterPage.tsx`

### CrmContact Interface

Add `title_fa: string | null` to the interface.

### fetchContacts

Update select to include `title_fa`:
```
.select('id, first_name, last_name, first_name_fa, last_name_fa, honorific_fa, title_fa, job_title, job_title_fa, is_primary_contact')
```

### applyContact

Update recipient name construction to combine all parts:
```
parts = [honorific_fa, title_fa, last_name_fa].filter(Boolean).join(' ')
```
Example output: "جناب آقای دکتر کریمی"

### Contact Dropdown Display

Include title in the bilingual display if present.

## Changes to `ContactType` Interface

Add `title_fa: string | null` to the exported `ContactType` interface in `CustomerContactForm.tsx`.

## File Summary

| File | Action | Changes |
|------|--------|---------|
| Migration SQL | Create | Add `title_fa` column to `customer_contacts` |
| `CustomerContactForm.tsx` | Modify | Split into Gender + Title dropdowns, update interface, form state, payload |
| `WritingLetterPage.tsx` | Modify | Add `title_fa` to interface/fetch, update name construction |

