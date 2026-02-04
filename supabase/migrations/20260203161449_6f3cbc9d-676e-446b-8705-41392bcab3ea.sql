-- Create 'Files' bucket for general file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('Files', 'Files', false)
ON CONFLICT (id) DO NOTHING;

-- Create 'Letters' bucket for letter uploads  
INSERT INTO storage.buckets (id, name, public)
VALUES ('Letters', 'Letters', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for 'Files' bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Files');

CREATE POLICY "Allow users to read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'Files');

CREATE POLICY "Allow users to update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'Files');

CREATE POLICY "Allow users to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'Files');

-- RLS policies for 'Letters' bucket
CREATE POLICY "Allow authenticated users to upload letters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Letters');

CREATE POLICY "Allow users to read letters"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'Letters');

CREATE POLICY "Allow users to update letters"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'Letters');

CREATE POLICY "Allow users to delete letters"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'Letters');