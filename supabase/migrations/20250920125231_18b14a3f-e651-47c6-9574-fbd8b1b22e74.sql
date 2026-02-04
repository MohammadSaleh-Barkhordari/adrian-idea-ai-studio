-- Create enum for letter status
CREATE TYPE letter_status AS ENUM (
  'fields_extracted',
  'letter_generated', 
  'preview_generated',
  'final_generated'
);

-- Add status column to letters table
ALTER TABLE letters 
ADD COLUMN status letter_status NOT NULL DEFAULT 'fields_extracted';