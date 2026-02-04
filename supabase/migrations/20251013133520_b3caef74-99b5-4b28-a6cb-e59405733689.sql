-- Update existing posts with NULL values to have default values
UPDATE blog_posts 
SET excerpt = 'No excerpt provided' 
WHERE excerpt IS NULL OR excerpt = '';

UPDATE blog_posts 
SET featured_image = '' 
WHERE featured_image IS NULL;

UPDATE blog_posts 
SET meta_description = excerpt 
WHERE meta_description IS NULL OR meta_description = '';

-- Now make the fields NOT NULL
ALTER TABLE blog_posts 
ALTER COLUMN excerpt SET NOT NULL,
ALTER COLUMN featured_image SET NOT NULL,
ALTER COLUMN meta_description SET NOT NULL,
ALTER COLUMN category_id SET NOT NULL;

-- Add a check constraint to ensure featured_image is not empty string
ALTER TABLE blog_posts
ADD CONSTRAINT blog_posts_featured_image_not_empty 
CHECK (featured_image != '');

-- Add a check constraint to ensure excerpt is not empty
ALTER TABLE blog_posts
ADD CONSTRAINT blog_posts_excerpt_not_empty 
CHECK (excerpt != '');

-- Add a check constraint to ensure meta_description is not empty
ALTER TABLE blog_posts
ADD CONSTRAINT blog_posts_meta_description_not_empty 
CHECK (meta_description != '');