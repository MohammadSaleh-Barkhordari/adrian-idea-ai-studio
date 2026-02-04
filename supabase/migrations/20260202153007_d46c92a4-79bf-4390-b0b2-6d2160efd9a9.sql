-- Add missing columns to letters table for letter generation functionality
ALTER TABLE public.letters 
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS generated_subject TEXT,
ADD COLUMN IF NOT EXISTS generated_body TEXT,
ADD COLUMN IF NOT EXISTS writer_name TEXT,
ADD COLUMN IF NOT EXISTS preview_image_url TEXT,
ADD COLUMN IF NOT EXISTS final_image_url TEXT,
ADD COLUMN IF NOT EXISTS needs_signature BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_stamp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preview_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS final_generated_at TIMESTAMPTZ;