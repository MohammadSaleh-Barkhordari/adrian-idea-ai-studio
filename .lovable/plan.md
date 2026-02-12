
# Preserve Original Filenames in All Upload Locations

## Problem
Several upload components rename files instead of keeping the original filename. This makes it hard to identify files later.

## Files That Need Changes

### 1. `src/components/LetterBuilder.tsx` (line 306)
- **Current**: Hardcodes `letter.png` as filename
- **Fix**: Since this is a programmatically generated PNG (not a user-uploaded file), it doesn't have an original name. We'll use the letter's subject/title as the filename instead: `{generated_subject || 'letter'}.png`
- Also update `ProjectAttachPicker.tsx` fallback path to match the new naming

### 2. `src/components/ContractUpload.tsx` (lines 66-68)
- **Current**: `{timestamp}-{random}.{ext}` (e.g., `1234567-abc.pdf`)
- **Fix**: `contracts/{file.name}` -- keep the original filename. Add a UUID prefix to avoid collisions: `contracts/{uuid}/{file.name}`

### 3. `src/pages/BlogEditorPage.tsx` (lines 238-240)
- **Current**: `{random}.{ext}` (e.g., `x7k2m.jpg`)
- **Fix**: `{uuid}/{file.name}` -- keep original filename under a unique folder

## Files Already Correct (no changes needed)
- `NewFileDialog.tsx` -- uses `{projectName}/{fileId}/{selectedFile.name}`
- `NewDocumentDialog.tsx` -- uses `{projectName}/{documentId}/{sanitizedFilename}`
- `NewLetterDialog.tsx` -- uses `{projectName}/{letterId}/{sanitizedFilename}`
- `NewTaskDialog.tsx` -- uses `{projectName}/{taskId}/{file.name}`
- `TaskEditDialog.tsx` -- uses `{projectName}/{taskId}/{file.name}`
- `EmployeeForm.tsx` -- uses `{employeeId}/profile/{file.name}`
- `EmployeeFormDocuments.tsx` -- uses `{employeeId}/{type}/{file.name}`
- `FinancialAnalysisPage.tsx` -- uses `{projectName}/Financial/{id}/{fileName}`
- `OurFinancialPage.tsx` -- uses `Financial/{id}/{fileName}`
- `CreateRequestPage.tsx` -- uses `Requests/{id}/{file.name}`

## Technical Details

### LetterBuilder.tsx
```
// Before (line 306):
const filePath = `${projectName}/${letterData.id}/letter.png`;

// After:
const safeTitle = (letterData.generated_subject || letterData.subject || 'letter')
  .replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_')
  .substring(0, 100);
const filePath = `${projectName}/${letterData.id}/${safeTitle}.png`;
```

### ContractUpload.tsx
```
// Before (lines 66-68):
const fileExt = file.name.split('.').pop();
const fileName = `${Date.now()}-${Math.random()...}.${fileExt}`;
const filePath = `contracts/${fileName}`;

// After:
const fileId = crypto.randomUUID();
const filePath = `contracts/${fileId}/${file.name}`;
```

### BlogEditorPage.tsx
```
// Before (lines 238-240):
const fileExt = file.name.split('.').pop();
const fileName = `${Math.random()...}.${fileExt}`;
const filePath = `${fileName}`;

// After:
const fileId = crypto.randomUUID();
const filePath = `${fileId}/${file.name}`;
```

### ProjectAttachPicker.tsx
Since the LetterBuilder filename changes, the fallback path in the picker won't work with a fixed name anymore. We'll remove the fallback entirely and only show letters that have a real `final_image_url` or `file_url` stored in the database. Letters without a generated image simply can't be attached.
