

# Customer Management (B2B CRM) -- Phase A: Database + Navigation

## Overview

Create 3 database tables (customers, customer_contacts, customer_interactions), add "Customers" to the dashboard navigation, create routing, and scaffold an empty Customer Management page.

## Step 1: Database Migration

Single migration with all 3 tables, RLS policies, indexes, and triggers. The SQL is exactly as specified in the request, with minor adjustments:

- `customers` table with 25+ columns, RLS (admins manage all, employees can view), indexes on status and account_manager_id, updated_at trigger
- `customer_contacts` table with CASCADE delete on customer_id, RLS matching customers pattern, indexes on customer_id and primary contact, updated_at trigger
- `customer_interactions` table with CASCADE on customer_id and SET NULL on contact_id, RLS (admins manage all, employees view + insert), indexes on customer_id, date, and follow-up

## Step 2: Add "Customers" to Dashboard Navigation

In `src/pages/DashboardPage.tsx`, add a new dashboard item after "HR Management":

```typescript
{
  title: 'Customers',
  description: 'Manage B2B customers and contacts',
  icon: Building2,
  path: '/customers',
  color: 'text-amber-500',
  requiresAdmin: true
}
```

Import `Building2` from lucide-react.

## Step 3: Add Routes in App.tsx

Add two new routes:
- `/customers` -- CustomerManagementPage (list)
- `/customers/:customerId` -- CustomerDetailPage (detail)

Both lazy-loaded following existing pattern.

## Step 4: Create Empty Pages

### `src/pages/CustomerManagementPage.tsx`
Scaffold with Navigation, Footer, auth check, admin role check -- matching HRManagementPage pattern. Show "Customer Management" header with an "Add Customer" button (disabled for now). Empty state message.

### `src/pages/CustomerDetailPage.tsx`
Scaffold with Navigation, Footer, auth check. Show "Customer Detail" header with back button. Placeholder content.

## Step 5: Storage Bucket

Create a `customer-logos` public storage bucket for company logos and contact photos.

## Files to create/modify

| File | Action |
|------|--------|
| Migration SQL | Create 3 tables + RLS + indexes + triggers |
| `src/App.tsx` | Add 2 lazy routes |
| `src/pages/DashboardPage.tsx` | Add Customers card + Building2 import |
| `src/pages/CustomerManagementPage.tsx` | New scaffold page |
| `src/pages/CustomerDetailPage.tsx` | New scaffold page |

## Technical Notes

- No changes to existing tables
- RLS uses `has_role()` for admins and subquery on `employees.user_id` for employee access -- same pattern as other tables
- The `account_manager_id` references `employees(id)`, linking customers to internal staff
- `created_by` references `profiles(id)` for audit trail consistency
- Phase B will implement the full customer list UI with stats, filters, table, and Add Customer form

