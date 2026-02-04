-- Add missing columns to the tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS task_name text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS task_type text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS outcome text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON public.tasks(task_type);