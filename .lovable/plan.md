

# Add Related Letters, Documents, and Files to Task Edit Dialog

## Problem
The `NewTaskDialog` has fields for Related Letters, Related Documents, and Related Files (allowing multi-select with badge chips and remove buttons), but the `TaskEditDialog` is completely missing these fields. When editing a task, users cannot see or modify the linked letters, documents, or files.

## Changes

### File: `src/components/TaskEditDialog.tsx`

**1. Add new state variables (after existing state declarations around line 68):**
- `relatedLetters` -- available letters from the project (fetched from `letters` table)
- `selectedLetters` -- currently linked letter IDs (fetched from `task_letters` join table)
- `relatedDocuments` -- available documents from the project
- `selectedDocuments` -- currently linked document IDs (fetched from `task_documents`)
- `relatedFileItems` -- available files from the project
- `selectedFileItems` -- currently linked file IDs (fetched from `task_files`, separate from outcome files)
- Add interfaces for `Letter`, `Document`, `FileItemOption` matching the NewTaskDialog pattern

**2. Add fetch functions:**
- `fetchRelatedLetters`: Query `letters` table filtered by `task.project_id`, get `id, generated_subject`
- `fetchRelatedDocuments`: Query `documents` table filtered by `task.project_id`, get `id, title, file_name`
- `fetchRelatedFileItems`: Query `files` table filtered by `task.project_id`, get `id, file_name, description`
- `fetchExistingRelationships`: Query all three join tables (`task_letters`, `task_documents`, `task_files`) to populate the selected arrays with currently linked item IDs

**3. Call fetches in `initializeForm` (the existing useEffect):**
- Call all four new fetch functions alongside the existing data loading

**4. Add UI sections between Successor Task and Assigned By (after line 541, before line 543):**
- Copy the exact same UI pattern from `NewTaskDialog` (lines 615-724):
  - Related Letters: Select dropdown to add + badge chips with X to remove
  - Related Documents: Select dropdown to add + badge chips with X to remove
  - Related Files: Select dropdown to add + badge chips with X to remove
- Admin users: full add/remove capability
- Non-admin users: read-only display showing linked item names as badges (no X button)

**5. Update `handleSubmit` to sync join tables (inside the admin save block):**
- After the main task update succeeds, sync each join table:
  - Fetch current `task_letters` for the task
  - Compare with `selectedLetters` to determine additions and removals
  - Delete removed relationships, insert new ones
  - Repeat for `task_documents` and `task_files` (being careful not to touch outcome files already managed by the existing file upload section)

**6. Reset state in `handleClose`:**
- Clear `selectedLetters`, `selectedDocuments`, `selectedFileItems` arrays

## Technical Details

### Relationship sync pattern:
```text
For each join table (task_letters, task_documents, task_files):
  1. Fetch current IDs from DB for this task
  2. Compare with selectedXxx state array
  3. toRemove = current IDs not in selected
  4. toAdd = selected IDs not in current
  5. DELETE rows in toRemove
  6. INSERT rows in toAdd
```

### Distinguishing outcome files vs related files:
The existing `task_files` join table is used for BOTH outcome file uploads AND related file selections. The `existingFiles` state already handles outcome files with remove/download. The new `selectedFileItems` will handle the "Related Files" picker. To avoid conflicts:
- `fetchExistingRelationships` will populate `selectedFileItems` from `task_files`
- The sync logic will handle all `task_files` entries together
- The outcome file section continues to work as before (upload new files, remove existing)

### No database changes needed -- all join tables already exist.

## Summary

| Section | Change |
|---------|--------|
| State & interfaces | Add 6 new state variables + 3 interfaces |
| Fetch functions | 4 new functions for available items + existing relationships |
| useEffect | Call new fetches during initialization |
| UI (admin) | 3 new multi-select sections with badge chips between Successor Task and Assigned By |
| UI (non-admin) | Read-only badge display of linked items |
| Submit handler | Sync join tables by diffing current vs selected |
| Cleanup | Reset new state arrays on close |

