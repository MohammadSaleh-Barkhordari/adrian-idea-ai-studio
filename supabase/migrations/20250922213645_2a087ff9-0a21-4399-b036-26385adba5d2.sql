-- Create RLS policies for Files storage bucket

-- Allow users to upload files to folders matching their owned projects
CREATE POLICY "Upload files for owned projects" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'Files' 
  AND EXISTS (
    SELECT 1 FROM adrian_projects p 
    WHERE p.project_name = (storage.foldername(name))[1] 
    AND p.user_id = auth.uid()
  )
);

-- Allow users to view files from their owned projects
CREATE POLICY "View files for owned projects" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'Files' 
  AND EXISTS (
    SELECT 1 FROM adrian_projects p 
    WHERE p.project_name = (storage.foldername(name))[1] 
    AND p.user_id = auth.uid()
  )
);

-- Allow users to update files from their owned projects
CREATE POLICY "Update files for owned projects" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'Files' 
  AND EXISTS (
    SELECT 1 FROM adrian_projects p 
    WHERE p.project_name = (storage.foldername(name))[1] 
    AND p.user_id = auth.uid()
  )
);

-- Allow users to delete files from their owned projects
CREATE POLICY "Delete files for owned projects" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'Files' 
  AND EXISTS (
    SELECT 1 FROM adrian_projects p 
    WHERE p.project_name = (storage.foldername(name))[1] 
    AND p.user_id = auth.uid()
  )
);