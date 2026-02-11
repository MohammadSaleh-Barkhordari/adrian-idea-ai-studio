

# Phase 3A: Form UI Rewrite — Structure + Documents Tab

## Overview

Rewrite EmployeeForm.tsx with a new 5-tab structure. The Documents tab is fully implemented; existing Personal, Employment, and Banking tabs are preserved as-is; a placeholder Insurance & Tax tab is added.

## New Files to Create

### 1. `src/components/hr/EmployeeFormDocuments.tsx`

Documents tab sub-component containing three sections:

**Section 1 — Associated User**
- Reuse existing `UserSelector` component (moved from Contract tab)
- After user selection, display their work email as a read-only Badge (from the `onValueChange` email callback)
- Preserve the existing `dataLoading` race-condition fix

**Section 2 — Profile Photo**
- Dropzone accepting JPG/PNG/WEBP
- Upload to `employee-documents` bucket under `{employee_id}/profile/{filename}`
- Save URL to `employees.profile_photo_url`
- Show preview of current/uploaded photo using Avatar component
- For new employees (no employee_id yet): hold file in local state, upload on form submit after employee creation

**Section 3 — Document Uploads**
- Six upload zones, each with its own dropzone:
  - Employment Contract (PDF, DOC, DOCX)
  - National Card / Cart Melli (JPG, PNG, PDF)
  - Shenasnameh (JPG, PNG, PDF)
  - Military Card (JPG, PNG, PDF)
  - Degree / Certificate (JPG, PNG, PDF) -- multiple allowed
  - Other Document (any file) -- multiple allowed, with title text input
- All zones visible regardless of nationality/gender (Option A)
- Each upload: file goes to `employee-documents/{employee_id}/{document_type}/{filename}`, then inserts a row in `employee_documents` table
- For NEW employees: show info message "Save the employee first to upload documents" and disable upload zones. Only UserSelector and profile photo are active.
- For EDIT mode: load existing documents from `employee_documents` table, display them in appropriate sections with preview (images) or filename (PDF/DOC) and a delete button
- Delete removes from both storage and `employee_documents` table

### 2. `src/components/hr/EmployeeFormInsurance.tsx`

Placeholder component with a Card showing "Insurance & Tax fields coming in Phase 3C"

## Changes to Existing Files

### `src/components/EmployeeForm.tsx` — Major restructure

**Tab structure change:**
- Replace `grid-cols-4` TabsList with `grid-cols-5`
- Tab order: Documents | Personal | Employment | Banking | Insurance & Tax
- Default tab changes from `"contract"` to `"documents"`
- Remove the old Contract tab content (UserSelector, ContractUpload, contract ID field)
- Move UserSelector into Documents tab
- Keep ContractUpload import for now (it will be used in Employment tab in Phase 3B for contract analysis)

**Form state additions:**
- Add `profile_photo_url: string` to formData
- Add `profile_photo_file: File | null` to local state (for new employee photo pending upload)

**handleSubmit updates:**
- After employee creation (new employee flow), if `profile_photo_file` exists: upload to storage, get URL, update `employees.profile_photo_url`
- Add `profile_photo_url` to the `employeeData` object sent to the employees table

**Data loading updates:**
- Load `profile_photo_url` from employee record in edit mode

## Component Data Flow

```text
EmployeeForm (parent)
  |-- formData state (all fields)
  |-- employee prop (edit mode)
  |
  +-- Tab 1: EmployeeFormDocuments
  |     props: formData, setFormData, employee, isNewEmployee
  |     - UserSelector updates formData.user_id
  |     - Profile photo updates formData.profile_photo_url
  |     - Document uploads go directly to DB (edit mode only)
  |
  +-- Tab 2: Personal (existing inline JSX, unchanged)
  +-- Tab 3: Employment (existing inline JSX, unchanged)  
  +-- Tab 4: Banking (existing inline JSX, unchanged)
  +-- Tab 5: EmployeeFormInsurance (placeholder)
```

## Key Technical Decisions

1. **New employee document flow**: Documents tab shows "Save employee first" message. Profile photo is buffered in local state and uploaded on submit. This avoids needing a temporary employee_id.

2. **Storage paths**: `employee-documents/{employee_id}/profile/`, `employee-documents/{employee_id}/contract/`, `employee-documents/{employee_id}/national_card/`, etc.

3. **Document type values** stored in `employee_documents.document_type`: `contract`, `national_card`, `shenasnameh`, `military_card`, `degree`, `certificate`, `profile_photo`, `other`

4. **Existing Contract tab removal**: The ContractUpload component (AI analysis) will be relocated to the Employment tab in Phase 3B. For now in 3A, it's removed from the form but the component file is kept.

5. **No changes to HRManagementPage.tsx** in this phase -- that's Phase 3D.

## Implementation Order

1. Create `src/components/hr/EmployeeFormDocuments.tsx`
2. Create `src/components/hr/EmployeeFormInsurance.tsx`
3. Rewrite `src/components/EmployeeForm.tsx` tab structure, state, and submit logic
