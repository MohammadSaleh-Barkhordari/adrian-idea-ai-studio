

# Phase C: Customer Detail Page

## Overview

Replace the placeholder `CustomerDetailPage` with a fully functional detail page featuring three tabs: Overview, Contacts, and Interactions. Also create two new modal form components for adding/editing contacts and logging interactions.

## New Files

### 1. `src/components/CustomerContactForm.tsx`

Modal form for adding/editing contacts at a customer company.

**Fields:**
- First Name *, Last Name * -- text inputs
- First Name (FA), Last Name (FA) -- text inputs with `dir="rtl"`
- Job Title, Department -- text inputs
- Email, Phone, Mobile -- text inputs
- LinkedIn URL -- text input
- Contact Type -- dropdown (business, technical, billing, executive)
- Is Primary Contact -- Switch toggle
- Is Decision Maker -- Switch toggle
- Photo upload -- file input (uploads to `customer-logos` bucket under `contacts/` path)
- Notes -- textarea

**Props:** `customerId: string`, `contact?: ContactType | null`, `onSuccess: () => void`, `onCancel: () => void`

### 2. `src/components/CustomerInteractionForm.tsx`

Modal form for logging interactions.

**Fields:**
- Interaction Type * -- dropdown with icons (meeting, call, email, proposal, contract_signed, invoice, note, other)
- Contact -- optional dropdown populated from customer's contacts
- Subject * -- text input
- Description -- textarea
- Interaction Date -- datetime input (defaults to now)
- Follow-up Date -- date input (optional)
- Follow-up Notes -- textarea (optional)

**Props:** `customerId: string`, `contacts: ContactType[]`, `onSuccess: () => void`, `onCancel: () => void`

### 3. `src/pages/CustomerDetailPage.tsx` -- Full Rewrite

**Data fetching on mount:**
- Fetch customer by ID from `customers` table
- Fetch contacts from `customer_contacts` where `customer_id` matches
- Fetch interactions from `customer_interactions` where `customer_id` matches, ordered by `interaction_date DESC`
- Fetch account manager name from `employees` if `account_manager_id` is set
- Fetch interaction creator names from `profiles`

**Header area:**
- Back button to `/customers`
- Company logo (Avatar, large) + Company name (EN + FA)
- Status badge (colored, same helper as list page)
- Edit button (opens CustomerForm in a Dialog)
- Quick stats row: X contacts, Y interactions, contract value

**Three tabs using Radix Tabs:**

#### Tab 1: Overview
- **Company Info card:** industry, company size, website (clickable), email, phone, address/city/country, LinkedIn (link), Instagram (link)
- **Contract Info card:** contract type (formatted label), start date, end date, monthly value with currency, status
- **Account Manager card:** manager name (from employees lookup), or "Not assigned"
- **Tags:** displayed as Badge components
- **Notes:** displayed in a muted text block

#### Tab 2: Contacts
- "Add Contact" button at top
- Grid/list of contact cards, each showing:
  - Photo avatar (or initials fallback)
  - Full name (EN + FA below)
  - Job title, department
  - Email, phone, mobile (with copy-friendly display)
  - Badges: "Primary Contact" (green), "Decision Maker" (purple), contact type (outline)
  - Edit and Delete action buttons
- Empty state when no contacts exist
- Add/Edit Contact Dialog using `CustomerContactForm`

#### Tab 3: Interactions / Activity
- "Log Interaction" button at top
- Filter by interaction type (optional dropdown)
- **Upcoming follow-ups** section at top: interactions where `follow_up_date` is set and `is_completed` is false, highlighted with a warning/amber card
- **Timeline list:** each interaction shows:
  - Type icon (Phone for call, Users for meeting, Mail for email, FileText for proposal, etc.)
  - Date (formatted)
  - Subject (bold)
  - Description (truncated)
  - Contact name if linked
  - "Logged by" name from profiles lookup
  - Mark complete button for follow-ups
- Empty state when no interactions
- Log Interaction Dialog using `CustomerInteractionForm`

## No Database Changes Needed

All three tables and RLS policies were created in Phase A.

## File Summary

| File | Action |
|------|--------|
| `src/components/CustomerContactForm.tsx` | Create |
| `src/components/CustomerInteractionForm.tsx` | Create |
| `src/pages/CustomerDetailPage.tsx` | Rewrite |

