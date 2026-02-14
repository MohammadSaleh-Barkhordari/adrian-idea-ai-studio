

# Defer Audio Transcription to Task Submit

## Current Behavior
When a user stops recording, `TaskVoiceRecorderBox` immediately calls the `voice-to-text` edge function and shows the transcription. This happens before the task is even saved.

## New Behavior
Recording only captures the audio blob. Transcription happens after the task is created/updated (on confirm). The transcript is saved directly to the database.

---

## Changes

### 1. TaskVoiceRecorderBox -- Remove Inline Transcription

**File**: `src/components/TaskVoiceRecorderBox.tsx`

- Remove the `processAudio` function (which calls `voice-to-text` immediately)
- On recording stop: just call `onAudioReady(blob)` and show a "Recording saved" message
- Remove the `onTranscribed` prop since transcription no longer happens here
- Remove the `transcription` prop and the read-only textarea
- Show a simple "Audio recorded" indicator instead (e.g., checkmark icon + file size)
- Remove the `supabase` import (no longer needed in this component)

### 2. NewTaskDialog -- Transcribe After Task Creation

**File**: `src/components/NewTaskDialog.tsx`

In the submit handler, after the task is inserted and audio blobs are uploaded:

- If `descriptionAudioBlob` exists: convert to base64, call `voice-to-text`, then update the task with `description_audio_transcription`
- If `outcomeAudioBlob` exists: convert to base64, call `voice-to-text`, then update the task with `outcome_audio_transcription`
- Remove the `descriptionTranscription` / `outcomeTranscription` state variables
- Remove the `onTranscribed` callbacks from the voice recorder boxes
- Remove the pre-submit transcription storage logic (lines 336-342)

The transcription flow becomes:
1. User records audio (blob stored in state)
2. User clicks Create
3. Task is inserted into DB
4. Audio blob is uploaded to storage
5. Audio blob is sent to `voice-to-text` for transcription
6. Task row is updated with `description_audio_transcription` / `outcome_audio_transcription`

### 3. TaskEditDialog -- Transcribe After Task Update

**File**: `src/components/TaskEditDialog.tsx`

Same pattern as NewTaskDialog:

- After the main task update and audio upload, transcribe any new audio blobs
- Remove transcription state and pre-submit transcription logic
- Remove the `onTranscribed` callbacks from voice recorder boxes
- For non-admin section: same treatment for outcome audio

### 4. Helper Function for Base64 Conversion + Transcription

To avoid duplicating the base64 conversion + API call logic, add a shared helper (inline in each dialog or as a utility):

```typescript
async function transcribeAudioBlob(blob: Blob): Promise<string | null> {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64Audio = btoa(binary);
  
  const { data, error } = await supabase.functions.invoke('voice-to-text', {
    body: { audio: base64Audio }
  });
  
  if (error || !data?.text?.trim()) return null;
  return data.text;
}
```

## Summary of Files to Change

| File | Change |
|------|--------|
| `src/components/TaskVoiceRecorderBox.tsx` | Remove inline transcription logic, simplify to record-only |
| `src/components/NewTaskDialog.tsx` | Move transcription to post-insert, remove transcription state |
| `src/components/TaskEditDialog.tsx` | Move transcription to post-update, remove transcription state |

No database or edge function changes needed -- same `voice-to-text` function is used, just called at a different time.

