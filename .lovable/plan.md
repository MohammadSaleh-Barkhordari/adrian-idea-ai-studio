

# Phase 3C: Banking Tab + Insurance & Tax Tab

## Overview

Two small changes: enhance the Banking tab with conditional field visibility, and replace the Insurance & Tax placeholder with real fields.

## File 1: `src/components/EmployeeForm.tsx` — Banking tab updates

### Change 1: Add conditional visibility for Bank Name / Account Number (lines 870-887)

Currently Bank Name and Bank Account Number always show. Wrap them so they only appear when `bank_account_type` is selected.

### Change 2: Add Sheba placeholder (line 905)

Add `placeholder="IR000000000000000000000000"` to the Sheba input.

## File 2: `src/components/hr/EmployeeFormInsurance.tsx` — Full rewrite

Replace the placeholder with actual form fields. The component needs to accept `formData` and `setFormData` props (same pattern as EmployeeFormDocuments).

Layout:
- Row 1: Insurance Number | Insurance Type (dropdown)
- Row 2: Insurance Start Date (full width, date input)
- Row 3: Tax ID | Tax Exemption Status (dropdown)

Dropdown values:
- Insurance Type: `tameen_ejtemaaei` ("Tameen Ejtemaaei (Social Security)"), `private` ("Private Insurance"), `supplementary` ("Supplementary"), `none` ("None")
- Tax Exemption Status: `none` ("No Exemption"), `partial` ("Partial Exemption"), `full` ("Full Exemption")

Props interface:
```typescript
interface EmployeeFormInsuranceProps {
  formData: { [key: string]: any };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}
```

## File 3: `src/components/EmployeeForm.tsx` — Update Insurance tab usage (line 916)

Pass `formData` and `setFormData` props to `EmployeeFormInsurance`:

```tsx
<EmployeeFormInsurance formData={formData} setFormData={setFormData} />
```

## Detailed change map

| File | Lines | Change |
|------|-------|--------|
| `EmployeeForm.tsx` | 870-887 | Wrap Bank Name + Account Number in `{!!formData.bank_account_type && (...)}` |
| `EmployeeForm.tsx` | 905 | Add Sheba placeholder |
| `EmployeeForm.tsx` | 916 | Pass props to EmployeeFormInsurance |
| `EmployeeFormInsurance.tsx` | 1-23 | Full rewrite with 5 form fields |

## Technical notes

- No database migrations needed -- all columns exist in `employee_sensitive_data` from Phase 2
- `handleSubmit` already saves all insurance/tax fields (lines 273-277) -- no changes needed
- `loadEmployeeData` already loads all insurance/tax fields (lines 178-182) -- no changes needed
- The formData initial state already has all 5 insurance/tax fields (lines 100-104) -- no changes needed

