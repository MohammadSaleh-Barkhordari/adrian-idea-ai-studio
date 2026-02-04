-- Create blog post version history table
CREATE TABLE IF NOT EXISTS public.blog_post_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  meta_description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_summary TEXT,
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_post_versions_post_id ON public.blog_post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_versions_created_at ON public.blog_post_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.blog_post_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for version history
CREATE POLICY "Admins can view all versions"
  ON public.blog_post_versions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authors can view their post versions"
  ON public.blog_post_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blog_posts
      WHERE blog_posts.id = blog_post_versions.post_id
      AND blog_posts.author_id = auth.uid()
    )
  );

CREATE POLICY "System can insert versions"
  ON public.blog_post_versions
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Function to automatically create version on post update
CREATE OR REPLACE FUNCTION public.create_blog_post_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_number INTEGER;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM public.blog_post_versions
  WHERE post_id = OLD.id;

  -- Create version record of the OLD data before update
  INSERT INTO public.blog_post_versions (
    post_id,
    version_number,
    title,
    content,
    excerpt,
    featured_image,
    meta_description,
    created_by,
    change_summary
  ) VALUES (
    OLD.id,
    v_version_number,
    OLD.title,
    OLD.content,
    OLD.excerpt,
    OLD.featured_image,
    OLD.meta_description,
    auth.uid(),
    'Auto-saved version before update'
  );

  RETURN NEW;
END;
$$;

-- Trigger to create versions on post updates
CREATE TRIGGER blog_post_version_trigger
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  WHEN (
    OLD.content IS DISTINCT FROM NEW.content OR
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.excerpt IS DISTINCT FROM NEW.excerpt
  )
  EXECUTE FUNCTION public.create_blog_post_version();