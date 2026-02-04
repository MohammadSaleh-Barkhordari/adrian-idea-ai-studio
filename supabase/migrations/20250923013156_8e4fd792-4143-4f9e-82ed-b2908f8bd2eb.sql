-- Update RLS policies for projects to be admin-only
-- Drop existing user-based policies for projects
DROP POLICY "Projects are viewable by owner" ON public.adrian_projects;
DROP POLICY "Projects are insertable by owner" ON public.adrian_projects;
DROP POLICY "Projects are updatable by owner" ON public.adrian_projects;
DROP POLICY "Projects are deletable by owner" ON public.adrian_projects;

-- Create admin-only policies for projects
CREATE POLICY "Admins can view all projects" 
ON public.adrian_projects 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create projects" 
ON public.adrian_projects 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects" 
ON public.adrian_projects 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects" 
ON public.adrian_projects 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Update RLS policies for related tables to be admin-only

-- Documents
DROP POLICY "Documents are viewable by owner" ON public.documents;
DROP POLICY "Documents are insertable by owner" ON public.documents;
DROP POLICY "Documents are updatable by owner" ON public.documents;
DROP POLICY "Documents are deletable by owner" ON public.documents;

CREATE POLICY "Admins can view all documents" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create documents" 
ON public.documents 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update documents" 
ON public.documents 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete documents" 
ON public.documents 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Files
DROP POLICY "Files are viewable by owner" ON public.files;
DROP POLICY "Files are insertable by owner" ON public.files;
DROP POLICY "Files are updatable by owner" ON public.files;
DROP POLICY "Files are deletable by owner" ON public.files;

CREATE POLICY "Admins can view all files" 
ON public.files 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create files" 
ON public.files 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update files" 
ON public.files 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete files" 
ON public.files 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Tasks
DROP POLICY "Tasks are viewable by owner" ON public.tasks;
DROP POLICY "Tasks are insertable by owner" ON public.tasks;
DROP POLICY "Tasks are updatable by owner" ON public.tasks;
DROP POLICY "Tasks are deletable by owner" ON public.tasks;

CREATE POLICY "Admins can view all tasks" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view tasks assigned to them" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (assigned_to = auth.email());

CREATE POLICY "Admins can create tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tasks" 
ON public.tasks 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));