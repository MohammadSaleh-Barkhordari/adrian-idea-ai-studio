
-- Drop duplicate columns
ALTER TABLE tasks DROP COLUMN IF EXISTS title;
ALTER TABLE tasks DROP COLUMN IF EXISTS completion_date;

-- Rename columns
ALTER TABLE tasks RENAME COLUMN completion_notes TO outcome_notes;
ALTER TABLE tasks RENAME COLUMN outcome_audio_url TO outcome_audio_path;

-- Add new columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS outcome_has_files boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS outcome_audio_transcription text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description_audio_path text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description_audio_transcription text;
