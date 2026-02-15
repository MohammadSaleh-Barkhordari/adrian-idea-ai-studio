

# App Subscriptions Tracker

## Overview
A new page at `/subscriptions` where all employees can see company app/service subscriptions -- costs, billing cycles, access instructions, and usage details. Admins can add/edit; employees have read-only access.

## Database Migration

Create the `subscriptions` table with all specified columns, RLS policies, indexes, and an `updated_at` trigger. Uses validation triggers instead of CHECK constraints (per project guidelines). References `employees(id)` for account_owner and `profiles(id)` for created_by.

Key RLS:
- Admins: full CRUD
- Active employees: SELECT only

## New Files

### 1. `src/pages/SubscriptionsPage.tsx`
Main page following the same pattern as `CustomerManagementPage.tsx`:

- **Auth check** and role detection (admin vs employee)
- **Stats cards** (4 across): Total Monthly Cost, Active Subscriptions, Upcoming Payments (next 7 days), Seats Usage
- **Filter bar**: Search by app name, category dropdown, status dropdown, billing cycle dropdown
- **Subscription cards** (not a table): Visual card grid showing logo/icon, app name, purpose, plan, cost, usage, teams, login info, status badge
- Cards have a colored left border based on category
- "Add Subscription" button visible only to admins
- "View Details" opens a detail dialog; "Edit" (admin only) opens the form dialog

Responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for cards, `grid-cols-2 sm:grid-cols-4` for stats, filters stack on mobile.

### 2. `src/components/SubscriptionForm.tsx`
Add/Edit dialog with 5 sections matching the spec:
- App Information, Billing, Access and Usage, Dates, Notes
- Uses `ScrollArea` inside `DialogContent` with `w-[95vw] sm:max-w-2xl`
- Fields use `grid-cols-1 sm:grid-cols-2` for responsive stacking
- Persian fields marked RTL with `dir="rtl"`
- Used By Teams as multi-select checkboxes
- Employee dropdown for Account Owner (fetched from `employees` table)

### 3. `src/components/SubscriptionCard.tsx`
Individual card component showing:
- Logo/placeholder icon, app name, status badge
- Purpose, plan, cost/cycle, renewal info
- Usage limit, seats progress bar
- Website link, login info, teams badges
- Action buttons: View Details, Edit (admin), Visit Site

### 4. `src/components/SubscriptionDetailDialog.tsx`
Read-only detail view dialog showing all subscription information:
- Full app info with clickable website
- Billing summary with "Payment in X days" countdown
- Seats usage progress bar
- Access instructions prominently displayed
- Notes section

## Route and Navigation Changes

### `src/App.tsx`
- Import and add route: `<Route path="/subscriptions" element={<SubscriptionsPage />} />`

### `src/pages/DashboardPage.tsx`
- Add a "Subscriptions" card to the `dashboardItems` array with `CreditCard` icon, path `/subscriptions`, visible to all authenticated users (no `requiresAdmin`)

## Technical Details

### Category color mapping:
```text
ai_tools: purple
design: pink
development: blue
communication: green
project_management: orange
marketing: red
analytics: teal
cloud_hosting: indigo
video_production: amber
storage: slate
3d_modeling: cyan
other: gray
```

### Monthly cost calculation:
- monthly: cost_per_cycle
- yearly: cost_per_cycle / 12
- weekly: cost_per_cycle * 4.33
- lifetime/free/pay_as_you_go: 0

### Data fetching:
- Fetch subscriptions with employee join for account_owner name
- Stats computed client-side from fetched data
- Employees fetched separately for account owner dropdown in form

### File summary:

| File | Action |
|------|--------|
| Database migration (SQL) | Create `subscriptions` table, RLS, indexes, trigger |
| `src/pages/SubscriptionsPage.tsx` | New page with stats, filters, card grid |
| `src/components/SubscriptionForm.tsx` | New add/edit dialog component |
| `src/components/SubscriptionCard.tsx` | New card display component |
| `src/components/SubscriptionDetailDialog.tsx` | New detail view dialog |
| `src/App.tsx` | Add `/subscriptions` route |
| `src/pages/DashboardPage.tsx` | Add Subscriptions nav card |

