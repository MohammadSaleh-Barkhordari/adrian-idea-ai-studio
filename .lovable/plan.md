

# Fix: Attachment Download Failing Due to Wrong Storage Path

## Root Cause

The letter PNG files in storage use the **project name** (e.g., `IWS`) in the path, NOT the **project ID** (e.g., `PROJ-20251012-660`).

- Actual storage path: `IWS/fc86fe3b-.../letter.png`
- What the code sends: `PROJ-20251012-660/fc86fe3b-.../letter.png`

This happens because the LetterBuilder uploads files using the project name (`project_name` from `adrian_projects`), but the ProjectAttachPicker constructs the fallback path using `project_id`.

Additionally, `final_image_url` and `file_url` are both `null` for these letters (status is `letter_generated`, not `final_generated`), so the fallback path is always used -- and it's wrong.

## Fix

### File: `src/components/email/ProjectAttachPicker.tsx`

Change the fallback storage path to use the **project name** instead of the project ID.

The `project` object (from the `projects` state) already has `project_name` available. Use it to construct the correct path:

**Before (line 89):**
```typescript
storage_path: d.final_image_url || d.file_url || `${pid}/${d.id}/letter.png`,
```

**After:**
```typescript
storage_path: d.final_image_url || d.file_url || `${project?.project_name || pid}/${d.id}/letter.png`,
```

Where `project` is already looked up from the `projects` array (used to get `pid`). This makes the fallback path `IWS/fc86fe3b-.../letter.png` which matches the actual storage structure.

No edge function changes needed -- the download logic is correct, it just receives the wrong path.

