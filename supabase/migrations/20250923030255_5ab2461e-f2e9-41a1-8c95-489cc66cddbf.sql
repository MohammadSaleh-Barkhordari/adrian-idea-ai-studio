-- Create task_files junction table with same pattern as task_letters and task_documents

-- Junction table for tasks and files (many-to-many)
CREATE TABLE public.task_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, file_id)
);

-- Enable RLS on task_files
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_files (same pattern as task_letters and task_documents)
CREATE POLICY "Admins can view all task files" 
ON public.task_files 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create task files" 
ON public.task_files 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update task files" 
ON public.task_files 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete task files" 
ON public.task_files 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for better performance
CREATE INDEX idx_task_files_task_id ON public.task_files(task_id);
CREATE INDEX idx_task_files_file_id ON public.task_files(file_id);

-- Migrate existing data from files.task_id to task_files junction table
INSERT INTO public.task_files (task_id, file_id)
SELECT task_id, id FROM public.files WHERE task_id IS NOT NULL;

-- Remove task_id column from files table
ALTER TABLE public.files DROP COLUMN task_id;