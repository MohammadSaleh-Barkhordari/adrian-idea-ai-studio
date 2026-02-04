-- Update Documents bucket to allow larger file sizes (100MB)
UPDATE storage.buckets 
SET file_size_limit = 104857600  -- 100MB in bytes (100 * 1024 * 1024)
WHERE id = 'Documents';

-- Verify the update was successful
SELECT id, name, file_size_limit, public 
FROM storage.buckets 
WHERE id = 'Documents';