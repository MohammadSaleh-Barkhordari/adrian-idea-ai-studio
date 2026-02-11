

# Link Writing a Letter to CRM

## Overview

Add Customer and Client Contact dropdowns to the letter composition form, enabling auto-fill of recipient fields from CRM data. Support pre-filling when navigating from a project page. Add optional `customer_id` and `customer_contact_id` FK columns to the `letters` table for traceability.

## Step 1: Database Migration (Optional FK columns)

```sql
ALTER TABLE letters ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id);
ALTER TABLE letters ADD COLUMN IF NOT EXISTS customer_contact_id uuid REFERENCES customer_contacts(id);
```

Lightweight change -- just two nullable columns for optional CRM linkage.

## Step 2: Update `src/pages/WritingLetterPage.tsx`

This is the only file that needs significant changes.

### New State Variables

- `customers` -- array of `{ id, company_name, customer_status }` fetched from `customers` table
- `contacts` -- array of customer contacts, loaded when a customer is selected
- `selectedCustomer` -- selected customer ID
- `selectedContact` -- selected contact ID
- `crmAutoFilled` -- object tracking which fields were auto-filled (for "from CRM" hints)

### New Data Fetching

- `fetchCustomers()` -- called on mount: `supabase.from('customers').select('id, company_name, customer_status').order('company_name')`
- `fetchContacts(customerId)` -- called when customer changes: `supabase.from('customer_contacts').select('*').eq('customer_id', customerId).eq('is_active', true)`
- Update `fetchProjects()` -- when a customer is selected, filter: `.eq('customer_id', selectedCustomerId)` plus include unlinked projects. When no customer, show all projects.

### Customer Selection Handler

When a customer is selected:
1. Set `selectedCustomer`, clear `selectedContact`
2. Auto-fill `recipientCompany` from `company_name`
3. Fetch contacts for that customer
4. Auto-select primary contact (`is_primary_contact = true`) if one exists
5. Re-fetch projects filtered by `customer_id`
6. Mark `crmAutoFilled` flags for company field

### Contact Selection Handler

When a contact is selected:
1. Set `selectedContact`
2. Auto-fill `recipientName` from `first_name + ' ' + last_name`
3. Auto-fill `recipientPosition` from `job_title`
4. Mark `crmAutoFilled` flags for name and position fields

### Pre-fill from Project (location.state)

Enhance the existing `location.state?.selectedProjectId` logic:
- After selecting the project, fetch the project's `customer_id` and `client_contact_id`
- If `customer_id` exists: auto-select customer, load contacts, load filtered projects
- If `client_contact_id` exists: auto-select contact, fill recipient fields

### Updated Form Layout

```text
Row 1: Customer (dropdown)          | Client Contact (dropdown, disabled until customer selected)
Row 2: Recipient Name (editable)    | Recipient Position (editable)
Row 3: Recipient Company (editable) | Date
Row 4: Project (filtered)           | Document
```

Each auto-filled field shows a small "from CRM" text hint below the input in muted text. Fields remain fully editable.

### Submit Updates

When inserting into `letters` table, include `customer_id` and `customer_contact_id` if selected. These are stored alongside the text fields for traceability.

### Voice Input Enhancement

In `handleFieldsExtracted`, after setting text fields, attempt fuzzy matching:
- Search `customers` for a company name match using `.ilike('company_name', '%extracted_company%')`
- If found, auto-select the customer and trigger the cascading logic
- If not found, just fill text fields as before (current behavior preserved)

### Reset Form

Add `selectedCustomer`, `selectedContact`, and `crmAutoFilled` to the `resetForm()` function.

## File Summary

| File | Action | Changes |
|------|--------|---------|
| Migration SQL | Create | Add `customer_id`, `customer_contact_id` to `letters` |
| `src/pages/WritingLetterPage.tsx` | Modify | Add CRM dropdowns, auto-fill logic, project filtering, pre-fill from project, voice matching |

## No Other Files Affected

The `VoiceRecorder`, `LetterBuilder`, and `NewLetterDialog` components do not need changes -- they work with the text fields which remain the source of truth for letter content.

