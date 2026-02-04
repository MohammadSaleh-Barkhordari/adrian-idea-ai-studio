-- Upload the letter template to Supabase storage bucket
-- First ensure the Documents bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('Documents', 'Documents', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'])
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];

-- Create storage policies for Documents bucket
CREATE POLICY "Documents are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'Documents');

CREATE POLICY "Authenticated users can upload to Documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'Documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update Documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'Documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete Documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'Documents' AND auth.role() = 'authenticated');