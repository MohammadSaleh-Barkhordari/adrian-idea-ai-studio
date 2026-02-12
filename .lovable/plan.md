

# Add Voice & Text Report to Task Outcome

## Overview

Add a voice recording option to the task outcome section in TaskEditDialog, allowing users to record their voice explanation of the outcome. The recording gets transcribed to text via the existing `voice-to-text` edge function and fills the outcome/completion notes fields. Also optionally store the audio file itself as an attachment.

## Step 1: Database Migration

Add a column to store the voice report audio URL for playback later:

```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS outcome_audio_url text;
```

This lets users listen back to the original voice recording even after transcription.

## Step 2: Create `src/components/TaskVoiceRecorder.tsx`

A lightweight voice recorder component (based on the existing VoiceRecorder/FinancialVoiceRecorder pattern) specifically for task outcomes:

- Record audio using `navigator.mediaDevices.getUserMedia` with the same config as existing recorders (16kHz, mono, noise suppression)
- On stop: convert to base64 (chunked, 32KB chunks per mobile stability memory), send to `voice-to-text` edge function
- Return transcribed text via `onTranscribed(text: string)` callback
- Also return audio blob via `onAudioReady(blob: Blob)` callback for optional storage
- Show recording state (recording indicator, timer, processing spinner)
- Compact design to fit inside the task dialog

Props interface:
```typescript
interface TaskVoiceRecorderProps {
  onTranscribed: (text: string) => void;
  onAudioReady?: (blob: Blob) => void;
  disabled?: boolean;
}
```

## Step 3: Update `src/components/TaskEditDialog.tsx`

### For Non-Admin Users ("Your Task Update" section, lines 550-607)

Add voice recording option to the Outcome field:

- Below the existing Outcome textarea, add the TaskVoiceRecorder component
- When voice is transcribed, append the text to the existing `userOutcome` value (or replace if empty)
- Add a toggle or tab-like UI: "Type" | "Record" so users can choose their input method
- Both methods can be used together (type some, record some)

### For Admin Users (Outcome section, lines 494-510)

Add the same voice recorder below the admin Outcome input field.

### Audio File Storage

When the user records audio:
1. Upload the audio blob to Supabase Storage (`Files` bucket) under `task-audio/{taskId}/{timestamp}.webm`
2. Store the public URL in `tasks.outcome_audio_url`
3. Show a playback button next to the outcome field if `outcome_audio_url` exists

### Updated Submit Logic

- Include `outcome_audio_url` in the update payload for both admin and non-admin paths

### Audio Playback

If `task.outcome_audio_url` exists, show a small audio player or play button next to the outcome text, so reviewers can listen to the original voice explanation.

## UI Layout (Non-Admin Outcome Section)

```text
Outcome
+-----------------------------------------+
| [Textarea: Describe what you did...]    |
+-----------------------------------------+

Voice Report
+------------------+----------------------+
| [Mic icon] Start Recording              |
| Recording... 0:05  [Stop]               |
| Processing...  [====>    ]              |
+------------------------------------------+

[Play icon] Listen to voice report  (if audio exists)
```

## File Summary

| File | Action | Changes |
|------|--------|---------|
| Migration SQL | Create | Add `outcome_audio_url` to `tasks` |
| `src/components/TaskVoiceRecorder.tsx` | Create | Compact voice recorder component for task outcomes |
| `src/components/TaskEditDialog.tsx` | Modify | Add voice recorder to outcome sections (admin + non-admin), audio upload/playback |

## Technical Notes

- Reuses the existing `voice-to-text` edge function (no backend changes needed)
- Follows the same 32KB chunked base64 conversion pattern for mobile stability
- Audio is stored in the existing `Files` storage bucket
- The transcribed text is appended to the outcome field, not replacing existing text
- Audio playback uses a native HTML `<audio>` element for simplicity

