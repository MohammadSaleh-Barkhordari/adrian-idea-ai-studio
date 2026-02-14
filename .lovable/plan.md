

# Batch 2: UI Changes for NewTaskDialog and TaskEditDialog

## Overview

Reorder form fields, add large textareas for description/notes/outcome notes, and replace the small voice recorder buttons with box-style card components matching the file upload visual style. Both dialogs get identical changes to maintain form parity.

---

## 1. New Component: TaskVoiceRecorderBox

Create `src/components/TaskVoiceRecorderBox.tsx` -- a card-style wrapper around the existing `TaskVoiceRecorder` logic.

Visual design matches the file upload area:
- `border-2 border-dashed border-muted-foreground/25 rounded-lg p-4`
- Mic icon centered, label "Record Description" or "Record Outcome"
- Start/Stop recording button
- Transcription textarea below showing transcribed text
- Accepts props: `label`, `onTranscribed`, `onAudioReady`, `transcription` (to display), `disabled`

This replaces the tiny `TaskVoiceRecorder` button everywhere.

---

## 2. NewTaskDialog Changes (src/components/NewTaskDialog.tsx)

### Add to formData state:
- `description: ''` (new field, currently `notes` is mapped to `description` column -- we need to separate them)

**Current mapping issue:** Line 318 maps `formData.notes` to the `description` DB column. We need to fix this:
- `formData.description` maps to DB `description`
- `formData.notes` maps to DB `notes` (currently not saved separately)

### New field order inside the form:
1. Task Name (unchanged)
2. **Description** -- large textarea `rows={5}`, new position right after task name
3. **Description Voice Recorder** -- box-style card component
4. Related Task / Letters / Documents / Files (unchanged, lines 487-614)
5. Assignment fields (unchanged, lines 616-661)
6. Start Date / Due Date (unchanged, lines 663-717)
7. Priority / Status (unchanged, lines 719-749)
8. Task Type (unchanged, lines 751-766)
9. **Notes** -- large textarea `rows={5}` (increase from `rows={3}`)
10. **Outcome Notes** -- new large textarea `rows={5}`, label "Outcome Notes"
11. **Outcome** with label and paperclip (move here, keep existing)
12. **Outcome Voice Recorder** -- box-style card (replaces small TaskVoiceRecorder)
13. Outcome File Upload (unchanged)

### Data mapping on submit:
- `description: formData.description || null` (new)
- `notes: formData.notes || null` (new -- currently not stored)
- `outcome_notes: formData.outcomeNotes || null` (new field in formData)

---

## 3. TaskEditDialog Changes (src/components/TaskEditDialog.tsx)

### Admin section -- new field order:
1. Task Name (unchanged)
2. **Description** -- large textarea `rows={5}` (move from line 594 to right after task name)
3. **Description Voice Recorder** -- box-style card
4. Related Task (unchanged)
5. Assigned By / Assigned To (unchanged)
6. Follow Up By (unchanged)
7. Start Date / Due Date (unchanged)
8. Priority / Status (unchanged)
9. **Notes** -- large textarea `rows={5}` (increase from `rows={3}`)
10. **Outcome Notes** -- large textarea `rows={5}`, rename label from "Completion Notes"
11. **Outcome** with voice recorder box (replaces small TaskVoiceRecorder)
12. File Upload (unchanged)

### Non-admin "Your Task Update" section:
- Rename "Completion Notes" label to "Outcome Notes" (line 669)
- Increase textarea rows to 5
- Replace `TaskVoiceRecorder` with box-style card
- Remove manual "Completion Date" picker (lines 678-692) -- it's auto-set now

### Data handling for new columns:
- On submit, include `description_audio_path` and `description_audio_transcription` when description voice recorder is used
- Include `outcome_audio_transcription` when outcome voice recorder is used
- Upload description audio to `task-audio/{taskId}/desc-{timestamp}.webm`

---

## 4. Store Audio Transcriptions and Paths

When voice is recorded and transcribed:
- **Description recorder**: upload audio to storage, save path to `description_audio_path`, save transcription to `description_audio_transcription`, and append text to description field
- **Outcome recorder**: upload audio to storage, save path to `outcome_audio_path`, save transcription to `outcome_audio_transcription`, and append text to outcome field

---

## Technical: Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/TaskVoiceRecorderBox.tsx` | **Create** -- box-style voice recorder component |
| `src/components/NewTaskDialog.tsx` | Modify -- reorder fields, add description textarea + voice box, add outcome notes, fix data mapping |
| `src/components/TaskEditDialog.tsx` | Modify -- reorder fields, add description voice box, rename labels, remove manual completion date picker, increase textarea rows |

No database changes needed -- all columns were added in Batch 1.

