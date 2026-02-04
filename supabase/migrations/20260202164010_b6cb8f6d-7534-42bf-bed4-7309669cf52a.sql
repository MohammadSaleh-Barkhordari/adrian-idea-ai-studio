-- Fix TASKS table - change project_id to text and add missing columns

-- Drop FK constraint on project_id if exists
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;

-- Add missing columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS follow_by text;
-- letter_id already added in previous migration

-- Change project_id to text type
ALTER TABLE tasks ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN project_id TYPE text USING project_id::text;
ALTER TABLE tasks ALTER COLUMN project_id DROP NOT NULL;