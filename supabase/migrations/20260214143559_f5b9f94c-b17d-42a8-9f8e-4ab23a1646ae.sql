-- Remove created_by from tasks (user_id and assigned_by cover ownership)
ALTER TABLE tasks DROP COLUMN IF EXISTS created_by;

-- Add cancellation tracking columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS canceled_by uuid REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS canceled_at timestamp with time zone;