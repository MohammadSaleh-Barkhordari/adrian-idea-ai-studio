

# Task Detail Outcome Dialog for Dashboard

## Overview

Create a new `TaskDetailOutcomeDialog` component used exclusively from the Dashboard's "My Tasks" section. It shows all task metadata as read-only display (no form inputs) and only allows editing the outcome section (status, outcome notes, voice recording, file upload).

## Changes

### 1. New Component: `src/components/TaskDetailOutcomeDialog.tsx`

A standalone dialog that:

- **Accepts props**: `open`, `onOpenChange`, `task` (the task object), `onTaskUpdated` callback
- **Fetches on open**: auth users (for email display), project name, existing files
- **Read-only display section** (all rendered as text/badges, no inputs):
  - Task Name (bold heading)
  - Description (pre-wrapped text) + play button for description audio if `description_audio_path` exists
  - Related Project (as a clickable link to `/projects/:projectId`)
  - Assigned By / Assigned To / Follow Up By / Confirm By (displayed as user emails in a 2x2 grid)
  - Start Date / Due Date (formatted dates in a 2-column row)
  - Priority (as a colored Badge) / Status (as a Badge)
  - Task Type (as text)
  - Notes (pre-wrapped text)
  - Predecessor Task / Successor Task names (if set)

- **Editable outcome section** (highlighted with blue left border, matching existing pattern):
  - Status dropdown (In Progress / Completed options)
  - Outcome Notes textarea (rows=5)
  - Outcome Voice Recorder (TaskVoiceRecorderBox component)
  - Play existing outcome audio if `outcome_audio_path` exists
  - File upload area (same pattern as TaskEditDialog: show existing files + upload new ones)

- **Save logic**: Only updates `outcome_notes`, `outcome_audio_path`, `outcome_audio_transcription`, `outcome_has_files`, `status`, and auto-sets `completed_at`/`completed_by` when status changes to completed

- **Footer**: "Update Outcome" button + small text: "To edit full task details, go to the project page" with a link

### 2. Update `src/pages/DashboardPage.tsx`

- Import `TaskDetailOutcomeDialog` instead of `TaskEditDialog`
- Replace the `TaskEditDialog` usage (lines 970-980) with `TaskDetailOutcomeDialog`
- Pass the same props (`open`, `onOpenChange`, `task`, `onTaskUpdated`)

### Technical Details

- Reuses existing utilities: `transcribeAudioBlob`, `TaskVoiceRecorderBox`, `sendNotification`
- Reuses the same file upload pattern from `TaskEditDialog` (upload to storage, create file record, link via task_files)
- Audio playback uses the Supabase storage public URL for `description_audio_path` and `outcome_audio_path`
- The component fetches auth users via `get-auth-users` edge function to resolve UUIDs to emails
- No database changes needed -- uses existing columns only

### Files Changed

| File | Change |
|------|--------|
| `src/components/TaskDetailOutcomeDialog.tsx` | New component |
| `src/pages/DashboardPage.tsx` | Swap `TaskEditDialog` for `TaskDetailOutcomeDialog` |

