ALTER TABLE requests ADD COLUMN IF NOT EXISTS confirm_by uuid REFERENCES profiles(id);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS description_audio_path text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS description_audio_transcription text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response_audio_path text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response_audio_transcription text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response_files_path text[];
ALTER TABLE requests ADD COLUMN IF NOT EXISTS response_by uuid REFERENCES profiles(id);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS responded_at timestamptz;