

# Fix: Audio Playback and File Storage in Task Dialogs

## Problems Found

### 1. Description audio has no playback in TaskEditDialog
The TaskEditDialog has a voice recorder for descriptions but no audio player to listen to previously recorded description audio. There is no `descriptionAudioUrl` state variable, and no `<audio>` element rendered for it.

### 2. Audio URLs built incorrectly (private bucket)
Both `TaskDetailOutcomeDialog` and `TaskEditDialog` build audio playback URLs incorrectly:
- **TaskDetailOutcomeDialog** uses `getPublicUrl()` on the private `Files` bucket -- this returns a URL that requires public access, which fails silently
- **TaskEditDialog** sets `outcomeAudioUrl` to the raw storage path string (e.g., `task-audio/uuid/123.webm`) instead of a playable URL

Both need to use `createSignedUrl()` which generates a temporary authenticated URL for private buckets.

### 3. File storage locations (answering your question)
All task-related files are stored in the **`Files`** storage bucket:
- **Task/Outcome files**: `{ProjectName}/{taskId}/{originalFilename}`
- **Description audio**: `task-audio/{taskId}/desc-{timestamp}.webm`
- **Outcome audio**: `task-audio/{taskId}/{timestamp}.webm`

## Planned Changes

### File: `src/components/TaskEditDialog.tsx`

1. Add a `descriptionAudioUrl` state variable
2. In the initialization `useEffect`, build signed URLs for both `description_audio_path` and `outcome_audio_path` using `createSignedUrl(path, 3600)` (1-hour expiry)
3. Add an `<audio>` player below the description voice recorder to play back existing description audio
4. Fix outcome audio URL to also use `createSignedUrl` instead of the raw path

### File: `src/components/TaskDetailOutcomeDialog.tsx`

1. Replace `getPublicUrl()` calls with `createSignedUrl()` for both `description_audio_path` and `outcome_audio_path`
2. Handle the async nature of `createSignedUrl` (it returns a promise unlike `getPublicUrl`)

### Technical Detail

```text
Before (broken):
  supabase.storage.from('Files').getPublicUrl(path)  // Returns unusable URL for private bucket

After (fixed):
  const { data } = await supabase.storage.from('Files').createSignedUrl(path, 3600)
  // Returns a temporary URL valid for 1 hour that works with private buckets
```

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/TaskEditDialog.tsx` | Add `descriptionAudioUrl` state, build signed URLs for both audio paths, add description audio player |
| `src/components/TaskDetailOutcomeDialog.tsx` | Replace `getPublicUrl` with `createSignedUrl` for both audio paths |

