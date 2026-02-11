

# Phase 3D: Update HRManagementPage

## Overview

Simplify and modernize the employee directory table. Remove all the "Protected" sensitive data columns (phone, email, address, DOB, salary, bank, contract ID) from the table -- those belong in the edit form only. Add profile photo avatar, work email, and employment type columns instead.

## Changes to `src/pages/HRManagementPage.tsx`

### 1. Update Employee interface (lines 34-46)

Add new fields to match the enriched schema:

```typescript
interface Employee {
  id: string;
  user_id: string | null;
  employee_number: string | null;
  name: string;
  surname: string;
  job_title: string | null;
  department: string | null;
  status: string;
  employment_type: string | null;
  job_type: string | null;
  start_date: string | null;
  work_location_type: string | null;
  profile_photo_url: string | null;
  created_at: string;
}
```

### 2. Add import for Avatar (line 8 area)

Import `Avatar, AvatarImage, AvatarFallback` from `@/components/ui/avatar`.

### 3. Add employment type filter state + filter dropdown

Add a new `statusFilter` state (rename current `employmentTypeFilter` to `statusFilter` for clarity) and a separate `employmentTypeFilter` for the new employment_type column. Add a new filter dropdown for employment type (full_time, part_time, contract, internship).

### 4. Update `fetchEmployees` query (lines 146-153)

Select only the fields needed for the directory table rather than `*`:

```typescript
const { data, error } = await query
  .select('id, user_id, employee_number, name, surname, job_title, department, status, employment_type, job_type, start_date, work_location_type, profile_photo_url, created_at')
  .order('created_at', { ascending: false });
```

### 5. Update filter logic (lines 193-230)

- Rename `employmentTypeFilter` usage to `statusFilter` for status filtering
- Add new `employmentTypeFilter` for the employment_type column
- Update `clearFilters` to reset the new filter

### 6. Rewrite table columns (lines 464-684)

Replace the current 16-column table (with many "Protected" placeholders) with a clean 9-column table:

| Column | Source | Sortable | Notes |
|--------|--------|----------|-------|
| Photo | profile_photo_url | No | Avatar with initials fallback |
| Name | name + surname | Yes | Full name |
| Employee # | employee_number | Yes | |
| Job Title | job_title | Yes | |
| Department | department | Yes | |
| Status | status | Yes | Colored badge |
| Employment Type | employment_type | Yes | Display label |
| Role | job_type | Yes | Badge |
| Actions | - | No | Edit + Delete |

Remove these "Protected" columns entirely: Phone, Personal Email, Address, Date of Birth, Salary, Pay Frequency, Bank Details, Contract ID, End Date.

The table min-width can be reduced from `1800px` to approximately `1000px`.

### 7. Status badge colors

```typescript
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case 'terminated': return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
    case 'on_leave': return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>;
    case 'resigned': return <Badge className="bg-gray-100 text-gray-800">Resigned</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};
```

### 8. Employment type display labels

```typescript
const getEmploymentTypeLabel = (type: string | null) => {
  switch (type) {
    case 'full_time': return 'Full Time';
    case 'part_time': return 'Part Time';
    case 'contract': return 'Contract';
    case 'internship': return 'Internship';
    default: return '-';
  }
};
```

### 9. Profile photo avatar in table row

```tsx
<TableCell>
  <Avatar className="h-8 w-8">
    {employee.profile_photo_url ? (
      <AvatarImage src={employee.profile_photo_url} alt={employee.name} />
    ) : null}
    <AvatarFallback className="text-xs">
      {employee.name?.charAt(0)}{employee.surname?.charAt(0)}
    </AvatarFallback>
  </Avatar>
</TableCell>
```

### 10. Stats cards update (lines 316-365)

The stats cards already use `status === 'active'` which is correct. No changes needed -- they already work with the current schema.

## Detailed change map

| Lines | Change |
|-------|--------|
| 1-31 | Add Avatar import |
| 34-46 | Expand Employee interface |
| 59-64 | Add/rename filter states (statusFilter + employmentTypeFilter) |
| 146-153 | Update select query to include new fields |
| 193-230 | Update filter logic for both status and employment_type |
| 250-255 | Update clearFilters |
| 405-416 | Add employment type filter dropdown |
| 429-434 | Update clear filter condition |
| 464-684 | Complete rewrite of table headers and body -- simplified from 16 to 9 columns |

## Technical notes

- No database migrations needed
- Querying `employees` table directly (not `employee_full` view) to avoid TypeScript type issues with views. Work email is not shown in the directory table since it's sensitive info accessible only via the edit form.
- Removing all "Protected" placeholder columns cleans up the table significantly and improves usability
- The `editingEmployee` passed to `EmployeeForm` will work because the Employee interface is a subset of what the form expects

