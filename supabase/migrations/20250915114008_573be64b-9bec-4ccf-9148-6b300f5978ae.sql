-- Add file-related columns to documents table
ALTER TABLE public.documents 
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size BIGINT,
ADD COLUMN mime_type TEXT;

-- Create storage policies for Documents bucket
CREATE POLICY "Users can view their own project documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload documents to their projects" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own project documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own project documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'Documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);