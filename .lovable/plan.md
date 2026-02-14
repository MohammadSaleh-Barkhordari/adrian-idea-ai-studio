

# Add Fields to Create Request Form

## Database Migration

The `requests` table currently has: `id`, `user_id`, `request_by`, `request_to`, `due_date`, `priority`, `description`, `status`, `created_at`, `updated_at`.

Add these missing columns:

```sql
ALTER TABLE requests ADD COLUMN IF NOT EXISTS confirm_by uuid REFERENCES profiles(id);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS description_audio_path text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS description_audio_transcription text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response_audio_path text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response_audio_transcription text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response_files_path text[];
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response_by uuid REFERENCES profiles(id);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS responded_at timestamptz;
```

## Form Changes -- CreateRequestPage.tsx

Add two new fields to the create form (requester view only):

1. **Confirm By** -- A user dropdown (same pattern as "Request To") saving a UUID to `confirm_by`. Placed after the "Request To" field.

2. **Description Audio** -- Reuse `TaskVoiceRecorderBox` with label "Record Description". On submit, upload audio blob to `Files` storage at `Requests/{requestId}/description_audio.webm`, save the path to `description_audio_path`, then run deferred transcription via `transcribeAudioBlob` and update `description_audio_transcription`.

Response fields (Response textarea, Response Audio, Response Files) are NOT shown on the create form since they belong to the responder/admin workflow.

## Submit Logic Update

After inserting the request:
1. If `confirm_by` is set, include it in the insert payload
2. If description audio blob exists, upload to storage and update the request record with `description_audio_path`
3. Run deferred transcription and update `description_audio_transcription`

## Files Changed

| File | Change |
|------|--------|
| Database migration | Add 9 new columns to `requests` table |
| `src/pages/CreateRequestPage.tsx` | Add Confirm By dropdown, Description Audio recorder, updated submit logic with audio upload and deferred transcription |

## Technical Details

- Reuses `TaskVoiceRecorderBox` component as-is (no rename needed)
- Reuses `transcribeAudioBlob` from `src/lib/transcribeAudio.ts`
- Audio stored in `Files` bucket under `Requests/{requestId}/description_audio.webm`
- Follows the same deferred transcription pattern used in task management
- Response-related fields will be used in a future view/edit request form for admins

