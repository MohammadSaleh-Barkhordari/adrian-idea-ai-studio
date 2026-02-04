-- Add language field to blog posts for separate FA/EN content
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'fa' CHECK (language IN ('en', 'fa'));

-- Remove bilingual fields since each post is now language-specific
ALTER TABLE blog_posts 
DROP COLUMN IF EXISTS title_fa,
DROP COLUMN IF EXISTS content_fa,
DROP COLUMN IF EXISTS excerpt_fa,
DROP COLUMN IF EXISTS meta_description_fa,
DROP COLUMN IF EXISTS og_description_fa,
DROP COLUMN IF EXISTS tags_fa;

-- Add index for language filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_language ON blog_posts(language);

-- Add language to categories too
ALTER TABLE blog_categories
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'fa' CHECK (language IN ('en', 'fa'));

-- Remove bilingual category fields
ALTER TABLE blog_categories
DROP COLUMN IF EXISTS name_fa,
DROP COLUMN IF EXISTS description_fa;

CREATE INDEX IF NOT EXISTS idx_blog_categories_language ON blog_categories(language);