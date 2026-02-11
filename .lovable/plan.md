

# Phase 3B: Personal Tab + Employment Tab

## Overview

Enhance the Personal and Employment tabs with all new fields, conditional logic, manager selector, and updated data save/load logic. The form state expands from ~18 fields to ~33 fields.

## Step 1: Expand formData state (EmployeeForm.tsx)

Add these new fields to the initial state (lines 42-69):

```
nationality: '',
name_fa: '',
surname_fa: '',
gender: '',
marital_status: '',
military_service_status: '',
emergency_contact_name: '',
emergency_contact_phone: '',
emergency_contact_relationship: '',
employment_type: '',
start_date: '',
end_date: '',
probation_end_date: '',
manager_id: '',
work_location_type: '',
contract_type: '',
```

Change `date_of_birth` from `Date | undefined` to `string` (store as ISO string, simpler for the new layout).

## Step 2: Update data loading (EmployeeForm.tsx, lines 73-113)

Add to the `setFormData` call in `loadEmployeeData`:

**From `employee` object:**
- `nationality`, `name_fa`, `surname_fa`, `employment_type`, `start_date`, `end_date`, `probation_end_date`, `manager_id`, `work_location_type`

**From `sensitiveData` object:**
- `gender`, `marital_status`, `military_service_status`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`, `contract_type`

Note: These fields already exist in the database tables from Phase 2 migrations.

## Step 3: Update handleSubmit (EmployeeForm.tsx, lines 138-244)

**employeeData object** -- add:
- `nationality`, `name_fa`, `surname_fa`, `employment_type`, `start_date`, `end_date`, `probation_end_date`, `manager_id`, `work_location_type`

**sensitiveData object** -- add:
- `gender`, `marital_status`, `military_service_status`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`, `contract_type`

Update `date_of_birth` handling to work with string format instead of Date object.

## Step 4: Rewrite Personal Tab (EmployeeForm.tsx, lines 271-355)

Replace the current inline JSX with a new `EmployeeFormPersonal` component (or inline rewrite). New layout:

| Row | Fields |
|-----|--------|
| 1 | Name (English) * -- Surname (English) * |
| 2 | Nationality * (full width, Select with common countries, "Iranian" first) |
| 3 | Name (Persian) -- Surname (Persian) -- conditional: `nationality === 'Iranian'` |
| 4 | Date of Birth (date input) -- Gender (Select: male/female/other) |
| 5 | Marital Status (Select) -- National ID (conditional: Iranian only) |
| 6 | Military Service Status (full width, conditional: Iranian + male) |
| 7 | Personal Email -- Personal Phone |
| 8 | Home Address (full width textarea) |
| --- | **Emergency Contact** section divider |
| 9 | Emergency Contact Name -- Emergency Contact Phone |
| 10 | Emergency Contact Relationship (Select: spouse/parent/sibling/friend/other) |

Conditional logic variables:
```typescript
const isIranian = formData.nationality === 'Iranian';
const isMale = formData.gender === 'male';
```

For Date of Birth: use a native HTML date input (`type="date"`) with string value, keeping it simple. The existing Calendar popover approach can be kept but switched to string-based value.

## Step 5: Rewrite Employment Tab (EmployeeForm.tsx, lines 357-431)

Replace inline JSX with enhanced layout:

| Row | Fields |
|-----|--------|
| 1 | Employee Number * (read-only on edit) -- Job Title * |
| 2 | Department -- Employment Type (Select: full_time/part_time/contract/internship) |
| 3 | Employment Status * (Select: active/on_leave/terminated/resigned) -- Work Location Type (Select: remote/hybrid/office_based) |
| 4 | Start Date -- End Date (conditional: status=terminated OR employment_type=contract) |
| 5 | Probation End Date -- Manager (Select from employees list, exclude self) |
| 6 | Job Type (Permissions) * (Select: admin/general_user) |
| --- | **Contract Details** section divider |
| 7 | Contract ID -- Contract Type (Select: permanent/fixed_term/project_based) |

**Manager selector**: Fetch employees list on mount, display as "Name Surname -- Job Title", save `id` to `manager_id`. Exclude current employee from the list.

## Step 6: Update Employee interface (EmployeeForm.tsx, line 19-30)

Add to the `Employee` interface the new fields that come from the employees table and are needed for edit mode data loading:
- `nationality`, `name_fa`, `surname_fa`, `employment_type`, `start_date`, `end_date`, `probation_end_date`, `manager_id`, `work_location_type`

## File Changes Summary

Only one file changes: **`src/components/EmployeeForm.tsx`**

No new files needed -- the Personal and Employment tabs remain inline in EmployeeForm.tsx (splitting into sub-components is optional and can be done in a cleanup pass). This keeps the change focused.

### Detailed change map:

| Section | Lines | Change |
|---------|-------|--------|
| Employee interface | 19-30 | Add 9 new optional properties |
| formData initial state | 42-69 | Add 16 new fields, change date_of_birth to string |
| loadEmployeeData | 83-106 | Add all new field mappings from employee + sensitiveData |
| employeeData in handleSubmit | 153-164 | Add 9 new fields |
| sensitiveData in handleSubmit | 166-180 | Add 7 new fields, update date_of_birth format |
| Personal tab JSX | 271-355 | Complete rewrite with new layout, conditionals, emergency contact section |
| Employment tab JSX | 357-431 | Complete rewrite with new fields, manager selector, contract section |

### New state added to component:
- `managers` state: `{ id: string; name: string; surname: string; job_title: string | null }[]` -- loaded on mount for manager dropdown

### New useEffect:
- Fetch managers list from `employees` table on mount (for the manager selector dropdown)

## Technical Notes

- No database migrations needed -- all columns already exist from Phase 2
- The `date_of_birth` field changes from `Date | undefined` to `string` (ISO date string). This simplifies form state and avoids timezone issues with the Calendar component. Will use `<input type="date">` for cleaner UX.
- Nationality uses a Select with common values (Iranian, Afghan, Iraqi, Turkish, British, American, etc.) rather than a full country list -- keeps it practical
- Manager selector excludes the current employee being edited to prevent self-referencing
- `employee_number` becomes read-only when editing (cannot change after creation)
- The `EmployeeFormDocuments` component props interface uses `[key: string]: any` so it already accepts the expanded formData without changes

