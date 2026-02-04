-- Add SEO and metadata fields to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_description_fa TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_description_fa TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags_fa TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';

-- Create blog activity log table
CREATE TABLE IF NOT EXISTS blog_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activity log
ALTER TABLE blog_activity_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON blog_activity_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON blog_activity_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to log blog changes
CREATE OR REPLACE FUNCTION log_blog_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO blog_activity_log (post_id, user_id, action, changes)
  VALUES (
    NEW.id,
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for blog activity logging
DROP TRIGGER IF EXISTS blog_activity_trigger ON blog_posts;
CREATE TRIGGER blog_activity_trigger
AFTER INSERT OR UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION log_blog_activity();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags_fa ON blog_posts USING GIN(tags_fa);
CREATE INDEX IF NOT EXISTS idx_blog_activity_log_post_id ON blog_activity_log(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_activity_log_created_at ON blog_activity_log(created_at DESC);