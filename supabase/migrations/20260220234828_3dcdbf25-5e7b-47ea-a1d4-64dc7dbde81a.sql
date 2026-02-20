
CREATE POLICY "Authenticated users can upload to Our_Life"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'Our_Life');

CREATE POLICY "Authenticated users can view Our_Life files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'Our_Life');

CREATE POLICY "Authenticated users can delete from Our_Life"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'Our_Life');
