

# Use AI-Suggested Title as Storage Filename for Documents

## What Changes

When uploading a document in a project, the file will be saved in storage using the AI-suggested document title (which auto-populates the "Document Title" field) instead of the original filename.

## Technical Details

### File: `src/components/NewDocumentDialog.tsx`

**Current behavior (line 195-196):**
```typescript
const sanitizedFilename = sanitizeFilename(selectedFile.name);
const filePath = `${projectName}/${documentId}/${sanitizedFilename}`;
```
The storage path uses the original file's name (e.g., `invoice-scan-2025.pdf`).

**New behavior:**
```typescript
// Get file extension from original file
const ext = selectedFile.name.includes('.') 
  ? selectedFile.name.substring(selectedFile.name.lastIndexOf('.')) 
  : '';
// Use the document title (which is the AI-suggested title) as the filename
const sanitizedFilename = sanitizeFilename(title.trim() + ext);
const filePath = `${projectName}/${documentId}/${sanitizedFilename}`;
```

The storage path will use the AI-suggested title (from the title field) plus the original file extension. For example, if the AI suggests "Q4 Financial Report" for a PDF upload, the file will be stored as `ProjectName/{uuid}/Q4_Financial_Report.pdf`.

The `title` variable is already populated with the AI suggestion (line 83: `if (data.suggestedTitle) setTitle(data.suggestedTitle)`), so this naturally uses the AI title. If AI analysis fails or is skipped, the title falls back to the filename without extension (line 148-149), so it still works gracefully.

No other files need changes.

