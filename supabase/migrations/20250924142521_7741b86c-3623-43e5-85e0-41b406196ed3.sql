-- Add follow_by column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN follow_by TEXT;