-- Add file-related columns to letters table for uploaded letters
ALTER TABLE public.letters 
ADD COLUMN letter_title text,
ADD COLUMN file_url text,
ADD COLUMN file_name text,
ADD COLUMN file_size bigint,
ADD COLUMN mime_type text;

-- Create RLS policies for Letters bucket
-- View letters for owned projects
CREATE POLICY "View letters for owned projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'Letters'
  AND EXISTS (
    SELECT 1
    FROM public.adrian_projects p
    WHERE p.project_name = (storage.foldername(name))[1]
      AND p.user_id = auth.uid()
  )
);

-- Upload letters for owned projects
CREATE POLICY "Upload letters for owned projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Letters'
  AND EXISTS (
    SELECT 1
    FROM public.adrian_projects p
    WHERE p.project_name = (storage.foldername(name))[1]
      AND p.user_id = auth.uid()
  )
);

-- Update letters for owned projects
CREATE POLICY "Update letters for owned projects"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'Letters'
  AND EXISTS (
    SELECT 1
    FROM public.adrian_projects p
    WHERE p.project_name = (storage.foldername(name))[1]
      AND p.user_id = auth.uid()
  )
);

-- Delete letters for owned projects
CREATE POLICY "Delete letters for owned projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Letters'
  AND EXISTS (
    SELECT 1
    FROM public.adrian_projects p
    WHERE p.project_name = (storage.foldername(name))[1]
      AND p.user_id = auth.uid()
  )
);