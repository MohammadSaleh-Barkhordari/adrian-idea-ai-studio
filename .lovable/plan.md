

# Link Projects to Customers

## Overview

Add `customer_id` and `client_contact_id` foreign key columns to `adrian_projects`, then update the project create/edit forms to use CRM customer/contact dropdowns instead of free-text fields. Update display logic on list and detail pages to show linked customer names as clickable links, with fallback to legacy text fields.

## Step 1: Database Migration

Add two nullable FK columns. Keep existing `client_name` and `client_company` columns intact.

```sql
ALTER TABLE adrian_projects 
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id);

ALTER TABLE adrian_projects 
  ADD COLUMN IF NOT EXISTS client_contact_id uuid REFERENCES customer_contacts(id);

CREATE INDEX idx_adrian_projects_customer ON adrian_projects(customer_id);
```

## Step 2: Update `NewProjectDialog.tsx`

**Replace** the `client_name` text input with a **Customer dropdown**:
- Fetch customers on mount: `supabase.from('customers').select('id, company_name, customer_status')`
- Show each option as: `Company Name` + status badge
- Store selected `customer_id` in form state
- On customer selection, fetch contacts and auto-select primary contact

**Replace** the `client_company` text input with a **Client Contact dropdown**:
- Disabled until a customer is selected
- Fetch contacts: `supabase.from('customer_contacts').select('*').eq('customer_id', selectedCustomerId)`
- Show each option as: `First Last -- Job Title`
- Auto-select contact where `is_primary_contact = true`
- Store selected `client_contact_id` in form state

**On submit**: Send `customer_id` and `client_contact_id` instead of `client_name`/`client_company`. Also populate `client_name` and `client_company` from the selected customer/contact for backward compatibility in existing queries.

Update the Zod schema: remove `client_name`/`client_company` string fields, add `customer_id` (optional string) and `client_contact_id` (optional string).

## Step 3: Update `ProjectEditDialog.tsx`

Same changes as NewProjectDialog:
- Add state for `customers`, `contacts`, `selectedCustomerId`, `selectedContactId`
- Fetch customers on mount
- When editing, pre-select the current `customer_id` and `client_contact_id`
- Replace Client Name input (lines 207-214) with Customer dropdown
- Replace Client Company input (lines 216-223) with Client Contact dropdown (disabled until customer selected)
- On customer change, load contacts and auto-select primary
- Update the `.update()` call to include `customer_id` and `client_contact_id`
- Update the Project interface to include `customer_id` and `client_contact_id`

## Step 4: Update `ProjectsPage.tsx` (List Page)

**Data fetching** (line 113-134):
- After loading projects, batch-fetch customer names for all projects that have `customer_id`:
  - Get unique customer IDs, query `customers` table for `id, company_name`
  - Build a lookup map `{ [id]: company_name }`

**Project card display** (line 422-424):
- Currently shows `project.client_name` in the CardDescription
- Change to: if `customer_id` is set, show customer company name (from lookup) as a clickable link to `/customers/:customerId`; otherwise fall back to `project.client_name` text

**Search filter** (line 157-165):
- Also search against the customer company name from the lookup map

## Step 5: Update `ProjectDetailsPage.tsx` (Detail Page)

**Data fetching** (loadProjectData, lines 202-288):
- After loading the project, if `customer_id` is set, fetch the customer: `supabase.from('customers').select('id, company_name, company_name_fa').eq('id', project.customer_id).single()`
- If `client_contact_id` is set, fetch the contact: `supabase.from('customer_contacts').select('first_name, last_name, job_title').eq('id', project.client_contact_id).single()`
- Store in state: `linkedCustomer`, `linkedContact`

**Display** (lines 481-495):
- **Company section** (line 489-495): If `linkedCustomer` exists, show company name as a clickable `Link` to `/customers/:id`. Otherwise fall back to `project.client_company` text.
- **Client section** (line 481-487): If `linkedContact` exists, show `First Last -- Job Title`. Otherwise fall back to `project.client_name` text.

**Update Project interface** (lines 31-47): Add `customer_id?: string` and `client_contact_id?: string`.

## File Summary

| File | Action | Changes |
|------|--------|---------|
| Migration SQL | Create | Add `customer_id`, `client_contact_id` columns + index |
| `src/components/NewProjectDialog.tsx` | Modify | Replace 2 text inputs with customer/contact dropdowns, update schema + submit |
| `src/components/ProjectEditDialog.tsx` | Modify | Same dropdown changes, pre-populate from existing data |
| `src/pages/ProjectsPage.tsx` | Modify | Fetch customer names, show as clickable links in cards |
| `src/pages/ProjectDetailsPage.tsx` | Modify | Fetch linked customer/contact, show as links with fallback |

## Technical Notes

- Legacy `client_name` and `client_company` columns are kept and still populated on save for backward compatibility
- The customer dropdown is optional (not required) to allow projects without a CRM customer
- Contact dropdown is disabled until a customer is selected, then auto-selects primary contact
- All display locations use a fallback pattern: linked FK data first, then legacy text field

