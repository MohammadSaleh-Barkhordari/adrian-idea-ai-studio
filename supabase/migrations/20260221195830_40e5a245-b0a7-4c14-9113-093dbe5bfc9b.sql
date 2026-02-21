
-- Remove allowed_mime_types and file_size_limit restrictions from our-life bucket
UPDATE storage.buckets 
SET allowed_mime_types = NULL, file_size_limit = NULL 
WHERE id = 'our-life';
