

# Add Job Title (Persian) Field

## Overview

Add a `job_title_fa` column to the `employees` table and integrate it into the Employment tab of the Employee Form and the HR Management directory table.

## Step 1: Database Migration

Add `job_title_fa` column to the `employees` table:

```sql
ALTER TABLE employees ADD COLUMN job_title_fa text;
```

No RLS changes needed -- existing policies cover the column.

## Step 2: Update `src/components/EmployeeForm.tsx`

### 2a. Add to Employee interface (line 20 area)
Add `job_title_fa?: string | null;`

### 2b. Add to formData initial state (line 79 area)
Add `job_title_fa: '',` in the Employment tab section.

### 2c. Update loadEmployeeData
Map `job_title_fa` from the employee object.

### 2d. Update handleSubmit employeeData object
Add `job_title_fa: formData.job_title_fa || null,`

### 2e. Update Employment tab JSX (after line 640)

Change Row 1 from a 2-column grid to include Job Title Persian. The new layout:

- Row 1: Employee Number | Job Title (English)
- Row 1b (new): Job Title (Persian) -- full width input below

```tsx
{/* Job Title Persian */}
<div>
  <Label htmlFor="job_title_fa">Job Title (Persian)</Label>
  <Input
    id="job_title_fa"
    value={formData.job_title_fa}
    onChange={(e) => setFormData(prev => ({ ...prev, job_title_fa: e.target.value }))}
    dir="rtl"
    placeholder="عنوان شغلی"
  />
</div>
```

## Step 3: Update `src/pages/HRManagementPage.tsx`

### 3a. Add to Employee interface (line 41 area)
Add `job_title_fa: string | null;`

### 3b. Update fetchEmployees select query
Add `job_title_fa` to the selected fields.

### 3c. Add Job Title (Persian) column to the directory table
Add a new column header and cell after Job Title, showing `job_title_fa` or `-` if null.

## Technical Notes

- One migration: adding a single nullable text column
- Three code touch points: Employee interface, form state/JSX, and directory table
- The field is optional (nullable) so no existing data breaks
- Input uses `dir="rtl"` for proper Persian text entry

