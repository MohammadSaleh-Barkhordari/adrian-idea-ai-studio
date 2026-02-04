-- Add foreign key constraint between tasks and adrian_projects tables
ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_project_id 
FOREIGN KEY (project_id) 
REFERENCES public.adrian_projects(project_id) 
ON DELETE CASCADE;