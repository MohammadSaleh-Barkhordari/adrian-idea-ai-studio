-- Allow users to update outcome and notes fields of tasks assigned to them
CREATE POLICY "Users can update outcome and notes of assigned tasks" 
ON public.tasks 
FOR UPDATE 
USING (assigned_to = auth.email())
WITH CHECK (assigned_to = auth.email());

-- Allow users to view files related to their assigned tasks
CREATE POLICY "Users can view files of assigned tasks" 
ON public.task_files 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_files.task_id 
    AND tasks.assigned_to = auth.email()
  )
);

-- Allow users to create files for their assigned tasks
CREATE POLICY "Users can create files for assigned tasks" 
ON public.task_files 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_files.task_id 
    AND tasks.assigned_to = auth.email()
  )
);

-- Allow users to delete files from their assigned tasks
CREATE POLICY "Users can delete files from assigned tasks" 
ON public.task_files 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_files.task_id 
    AND tasks.assigned_to = auth.email()
  )
);

-- Allow users to view files that are associated with their assigned tasks
CREATE POLICY "Users can view files associated with assigned tasks" 
ON public.files 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.task_files tf
    JOIN public.tasks t ON tf.task_id = t.id
    WHERE tf.file_id = files.id 
    AND t.assigned_to = auth.email()
  )
);