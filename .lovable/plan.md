

# Clean Up NewTaskDialog: Remove Fields, Reorder UI, Add Voice Recording

## Changes to `src/components/NewTaskDialog.tsx`

### 1. Remove `created_by` from the insert
- Line 320: Remove `created_by: user.id` from the `taskData` object
- The `user_id` field already tracks ownership

### 2. Add `task_type` selector to the form
- Add a new Select field for Task Type with options: `general`, `meeting`, `follow_up`, `review`, `delivery` (or similar)
- Add `taskType` to `formData` state with default `'general'`
- Include `task_type: formData.taskType` in the insert object

### 3. Move Notes above Outcome section
Current order: Outcome -> Outcome File Upload -> Notes
New order: **Notes -> Outcome -> Outcome File Upload**

- Move the Notes block (lines 814-824) to appear before the Outcome block (line 737)

### 4. Add TaskVoiceRecorder to the Outcome section
- Import `TaskVoiceRecorder` from `@/components/TaskVoiceRecorder`
- Place it below the Outcome text input, before the file upload area
- Wire `onTranscribed` to append transcribed text to `formData.outcome`

### 5. Remove completion columns concern
- `completed_at`, `completion_date`, and `completion_notes` are not in the creation form (correct behavior -- they belong in the edit/update dialog). No changes needed here.

## Technical Details

### Form field order (after changes):
1. Task Name
2. Related Task
3. Related Letters / Documents / Files
4. Assignment fields (Assigned By, Assigned To)
5. Follow Up By
6. Start Date / Due Date
7. Priority / Status
8. Task Type (new)
9. **Notes** (moved up)
10. Outcome + Voice Recorder (added)
11. Outcome File Upload

### Files to change:
- `src/components/NewTaskDialog.tsx`
  - Remove `created_by` from insert
  - Add `taskType` to form state and insert
  - Add Task Type Select UI
  - Move Notes above Outcome
  - Import and add TaskVoiceRecorder component

