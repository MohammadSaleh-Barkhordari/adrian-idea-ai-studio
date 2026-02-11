

# Phase B: Customer List Page -- Full Implementation

## Overview

Build a complete customer management list page with stats cards, search/filter bar, sortable table, and an Add/Edit Customer dialog. Follows the same patterns as `HRManagementPage.tsx`.

## New Files

### 1. `src/components/CustomerForm.tsx` -- Add/Edit Customer Modal Form

A form component (similar to `EmployeeForm`) with two sections:

**Company Details section:**
- Company Name (EN) * -- text input
- Company Name (FA) -- text input, `dir="rtl"`
- Industry -- dropdown (Automotive, Technology, FMCG, Healthcare, Finance, Education, Manufacturing, Retail, Services, Other)
- Company Size -- dropdown (1-10, 11-50, 51-200, 201-500, 500+)
- Website, Email, Phone -- text inputs
- Address, City, Country -- text inputs (country defaults to "Iran")
- LinkedIn URL, Instagram URL -- text inputs
- Logo upload -- file input uploading to `customer-logos` storage bucket
- Brand Color -- color input (optional)

**Business Relationship section:**
- Customer Status * -- dropdown (lead, prospect, active, inactive, churned)
- Contract Type -- dropdown (project_based, retainer, subscription, one_time)
- Contract Start Date, End Date -- date inputs
- Monthly Value -- number input
- Currency -- dropdown (IRR, USD, EUR, GBP)
- Account Manager -- dropdown populated from `employees` table (active employees only)
- Tags -- comma-separated text input (stored as text[])
- Notes -- textarea

**Props:** `customer?: Customer | null`, `onSuccess: () => void`, `onCancel: () => void`

**Behavior:**
- On submit: `supabase.from('customers').insert(...)` or `.update(...)` based on whether editing
- Sets `created_by` to current user ID on insert
- Shows toast on success/error

## Modified Files

### 2. `src/pages/CustomerManagementPage.tsx` -- Full Rewrite

Replace the scaffold with a complete page following the HR Management pattern:

**State:**
- `customers` array, `customersLoading` boolean
- `showCustomerForm`, `editingCustomer` for the dialog
- `searchTerm`, `statusFilter`, `industryFilter` for filtering
- `sortColumn`, `sortDirection` for sorting

**Data fetching:**
- Query `customers` table with select of all needed fields
- Also fetch primary contact for each customer via a second query to `customer_contacts` where `is_primary_contact = true`
- Fetch account manager names from `employees` table

**Stats cards (4 cards):**

| Card | Icon Color | Value |
|------|-----------|-------|
| Total Customers | blue | `customers.length` |
| Active Customers | green | customers where `customer_status === 'active'` |
| Total Monthly Value | purple | sum of `monthly_value` for active customers, formatted with currency |
| Leads | orange | customers where `customer_status === 'lead'` |

**Filter bar:**
- Search input (searches company_name, company_name_fa, industry, email)
- Status filter dropdown: All / Lead / Prospect / Active / Inactive / Churned
- Industry filter dropdown: dynamically populated from unique industries in data
- Clear filters button (shown when any filter is active)

**Customer table columns:**

| Column | Sortable | Content |
|--------|----------|---------|
| Logo | No | Avatar with company initials fallback |
| Company Name | Yes | company_name (+ company_name_fa in small text below) |
| Industry | Yes | industry or "-" |
| Status | Yes | Colored badge (lead=blue, prospect=indigo, active=green, inactive=gray, churned=red) |
| Primary Contact | No | Name from joined customer_contacts or "-" |
| Monthly Value | Yes | Formatted number + currency |
| Account Manager | No | Employee name from joined employees or "-" |
| Actions | No | View (navigates to `/customers/:id`), Edit (opens form), Delete (with confirmation) |

**Clickable rows:** Clicking a row navigates to `/customers/:customerId`.

**Add/Edit Customer dialog:**
- Uses `CustomerForm` component inside a `Dialog`
- "Add Customer" button in header opens the form
- Edit button in actions column opens the form pre-filled

**Empty states:**
- No customers at all: icon + "Start by adding your first customer" + button
- Filters return nothing: icon + "Try adjusting your search filters"

## Technical Details

### Customer interface
```typescript
interface Customer {
  id: string;
  company_name: string;
  company_name_fa: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  customer_status: string;
  contract_type: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  monthly_value: number | null;
  currency: string | null;
  logo_url: string | null;
  brand_color: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  notes: string | null;
  tags: string[] | null;
  account_manager_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
```

### Status badge helper
```typescript
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'lead': return <Badge className="bg-blue-100 text-blue-800">Lead</Badge>;
    case 'prospect': return <Badge className="bg-indigo-100 text-indigo-800">Prospect</Badge>;
    case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case 'inactive': return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    case 'churned': return <Badge className="bg-red-100 text-red-800">Churned</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};
```

### Currency formatting
```typescript
const formatCurrency = (value: number | null, currency: string | null) => {
  if (value == null) return '-';
  const symbol = { IRR: 'IRR', USD: '$', EUR: 'EUR', GBP: 'GBP' }[currency || 'IRR'] || currency;
  return `${symbol} ${value.toLocaleString()}`;
};
```

### Logo upload in CustomerForm
Upload to `customer-logos` bucket, get public URL, store in `logo_url` field. Uses the same pattern as profile photo uploads in EmployeeForm.

### Account Manager lookup
Fetch active employees on form mount for the dropdown: `supabase.from('employees').select('id, name, surname').eq('status', 'active')`.

On the list page, fetch account manager names in a separate query or join after loading customers.

### Primary Contact lookup
After fetching customers, batch-fetch primary contacts: `supabase.from('customer_contacts').select('customer_id, first_name, last_name').eq('is_primary_contact', true)`.

Map them into a lookup object `{ [customer_id]: "First Last" }`.

## No database changes needed

All tables (`customers`, `customer_contacts`, `customer_interactions`) and the `customer-logos` storage bucket were created in Phase A.

## File summary

| File | Action |
|------|--------|
| `src/components/CustomerForm.tsx` | Create -- full Add/Edit form |
| `src/pages/CustomerManagementPage.tsx` | Rewrite -- stats, filters, table, dialog |

