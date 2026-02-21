
-- Drop incorrectly-named policies
DROP POLICY IF EXISTS "Authenticated users can upload to Our_Life" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view Our_Life files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from Our_Life" ON storage.objects;

-- Recreate with correct bucket id 'our-life'
CREATE POLICY "Authenticated users can upload to our-life"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'our-life');

CREATE POLICY "Authenticated users can view our-life files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'our-life');

CREATE POLICY "Authenticated users can delete from our-life"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'our-life');
