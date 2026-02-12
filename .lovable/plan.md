

# Add CRM Contact Picker to Email Compose

## What Changes

Add two optional dropdown selectors (Company and Contact) above the "To" field in the Email Compose dialog. When a user selects a company, the contacts dropdown populates with that company's contacts. Selecting a contact auto-fills the "To" email field with the contact's email address. The "To" field remains fully editable -- users can still type manually or use the existing email_contacts autocomplete.

## Technical Details

### File: `src/components/email/EmailCompose.tsx`

**New state variables:**
- `crmCustomers` -- list of customers fetched from `customers` table
- `crmContacts` -- list of contacts for the selected customer
- `selectedCustomerId` -- currently selected customer
- `selectedContactId` -- currently selected contact

**New data fetching:**
- `fetchCustomers()` -- called when dialog opens in `mode === 'new'`, queries `customers` table for `id, company_name, company_name_fa`
- `fetchCrmContacts(customerId)` -- queries `customer_contacts` for `id, first_name, last_name, first_name_fa, last_name_fa, email` filtered by `customer_id` and `is_active = true`

**New UI (above the "To" input, only shown when `mode === 'new'`):**
- Two `<Select>` dropdowns side by side:
  1. **Company** -- shows `company_name -- company_name_fa` (bilingual)
  2. **Contact** -- shows `first_name last_name` (filtered by selected company), disabled until a company is selected
- When a contact is selected: auto-fill `to` with `contact.email` and `toName` with `contact.first_name + ' ' + contact.last_name`

**Reset logic:**
- Clear CRM state when dialog closes or on discard
- Clear contacts dropdown and "To" field when company changes
- Company/contact dropdowns only visible for `mode === 'new'` (not reply/forward)

### No other files need changes
The Select component from `@radix-ui/react-select` is already available via `src/components/ui/select.tsx`.

