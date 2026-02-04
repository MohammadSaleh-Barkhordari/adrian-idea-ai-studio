-- Add new fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN related_task_id uuid REFERENCES public.tasks(id),
ADD COLUMN start_time timestamp with time zone,
ADD COLUMN outcome_file_name text,
ADD COLUMN outcome_file_url text,
ADD COLUMN outcome_file_size bigint,
ADD COLUMN outcome_mime_type text;

-- Create index for better performance on related task queries
CREATE INDEX idx_tasks_related_task_id ON public.tasks(related_task_id);