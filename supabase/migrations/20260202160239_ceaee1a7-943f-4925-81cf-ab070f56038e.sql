-- Fix 4: Explicit WITH CHECK for our_financial
DROP POLICY IF EXISTS "Users can manage own financial records" ON our_financial;
CREATE POLICY "Users can manage own financial records"
ON our_financial FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix 5: UPDATE policy for tasks (assigned users can update their tasks)
CREATE POLICY "Assigned users can update their tasks"
ON tasks FOR UPDATE
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- Fix 6: SELECT policy for letters (creators can view own letters)
CREATE POLICY "Creators can view own letters"
ON letters FOR SELECT
USING (created_by = auth.uid());

-- Fix 7: SELECT policy for documents (project team members can view)
CREATE POLICY "Project members can view documents"
ON documents FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM adrian_projects 
    WHERE id = documents.project_id 
    AND (assigned_to = auth.uid() OR user_id = auth.uid() OR created_by = auth.uid())
  )
);

-- Fix 8: SELECT policy for files (project team members can view)
CREATE POLICY "Project members can view files"
ON files FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM adrian_projects 
    WHERE id = files.project_id 
    AND (assigned_to = auth.uid() OR user_id = auth.uid() OR created_by = auth.uid())
  )
);