

# Letter-CRM Integration: Honorifics + Persian Data

## Overview

Add Persian honorific and job title fields to customer contacts, update the contact form, and modify the Writing a Letter page to auto-fill recipient fields with Persian data (honorific + last name, Persian job title, Persian company name) instead of English.

## Step 1: Database Migration

Add two new columns to `customer_contacts`:

```sql
ALTER TABLE customer_contacts ADD COLUMN IF NOT EXISTS honorific_fa text;
ALTER TABLE customer_contacts ADD COLUMN IF NOT EXISTS job_title_fa text;
```

No other schema changes needed. `first_name_fa`, `last_name_fa` already exist on `customer_contacts`, and `company_name_fa` already exists on `customers`.

## Step 2: Update `src/components/CustomerContactForm.tsx`

### Form State

Add two new fields to the form state object:
- `honorific_fa: ''`
- `job_title_fa: ''`

Update the `useEffect` that populates form from `contact` prop to include these fields.

### ContactType Interface

Add to the exported `ContactType` interface:
- `honorific_fa: string | null`
- `job_title_fa: string | null`

### New Form Fields (placed after the Persian name row)

**Honorific (Persian)** -- a Select dropdown with predefined options + a custom text input fallback:
- Options: `آقای`, `خانم`, `جناب`, `سرکار خانم`, `دکتر`, `مهندس`, `حجت‌الاسلام`, `custom`
- When "custom" is selected, show a text Input below for free-form entry
- Label: `Honorific (FA)`, RTL

**Job Title (Persian)** -- a text Input:
- Label: `Job Title (FA)`, `dir="rtl"`
- Placeholder: e.g., `مدیر عامل`

Place these in a 2-column grid row right after the Persian names row:
```
Row: Honorific (FA) dropdown | Job Title (FA) text input
```

### Submit Payload

Add `honorific_fa` and `job_title_fa` to the insert/update payload.

## Step 3: Update `src/pages/WritingLetterPage.tsx`

### CrmContact Interface Update

Add Persian fields to the `CrmContact` interface:
- `first_name_fa: string | null`
- `last_name_fa: string | null`
- `honorific_fa: string | null`
- `job_title_fa: string | null`

### CrmCustomer Interface Update

Add `company_name_fa: string | null` to the `CrmCustomer` interface.

### fetchCustomers Update

Change the select to include `company_name_fa`:
```
.select('id, company_name, company_name_fa, customer_status')
```

### fetchContacts Update

Change the select to include Persian fields:
```
.select('id, first_name, last_name, first_name_fa, last_name_fa, honorific_fa, job_title, job_title_fa, is_primary_contact')
```

### Auto-fill Logic Changes

**`handleCustomerChange`**: When a customer is selected:
- Set `recipientCompany` to `company_name_fa` if available, otherwise `company_name` (Persian first)

**`applyContact`**: When a contact is selected/applied:
- Set `recipientName` to:
  - `honorific_fa + ' ' + last_name_fa` if both exist (e.g., "جناب کریمی")
  - Just `last_name_fa` if honorific is empty but last_name_fa exists
  - Fallback to `first_name + ' ' + last_name` (English) if no Persian data
- Set `recipientPosition` to:
  - `job_title_fa` if available
  - Fallback to `job_title` (English)

**`prefillFromProject`**: Same cascading logic applies -- when fetching the customer for pre-fill, include `company_name_fa` and use Persian-first auto-fill.

### Dropdown Display (Bilingual)

**Customer dropdown items**: Show both languages for identification:
```
company_name — company_name_fa
```
Example: "ISACO -- ایساکو". If no FA name, show EN only.

**Contact dropdown items**: Show both languages + Persian job title:
```
First Last — first_name_fa last_name_fa — job_title_fa
```
Example: "Davood Karimi -- داوود کریمی -- قائم مقام". Omit parts that are null.

### Recipient Text Fields

Add `dir="rtl"` to the Recipient Name, Position, and Company Input elements since the auto-filled content will be Persian. The fields remain fully editable.

### Voice Input Enhancement

In `handleFieldsExtracted`, when a CRM match is found, the `applyContact` and `handleCustomerChange` functions will now automatically use Persian data. No additional changes needed beyond what those functions already do -- the voice handler calls them and they now output Persian.

## File Summary

| File | Action | Changes |
|------|--------|---------|
| Migration SQL | Create | Add `honorific_fa`, `job_title_fa` to `customer_contacts` |
| `src/components/CustomerContactForm.tsx` | Modify | Add honorific dropdown + job_title_fa field, update interface + payload |
| `src/pages/WritingLetterPage.tsx` | Modify | Update interfaces, fetch Persian fields, Persian-first auto-fill, bilingual dropdowns, RTL inputs |

