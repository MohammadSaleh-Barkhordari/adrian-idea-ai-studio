-- Remove file-related columns from tasks table
ALTER TABLE public.tasks 
DROP COLUMN IF EXISTS outcome_file_name,
DROP COLUMN IF EXISTS outcome_file_url, 
DROP COLUMN IF EXISTS outcome_file_size,
DROP COLUMN IF EXISTS outcome_mime_type;

-- Add task_id column to files table with foreign key reference
ALTER TABLE public.files 
ADD COLUMN task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Create index on files.task_id for performance
CREATE INDEX IF NOT EXISTS idx_files_task_id ON public.files(task_id);