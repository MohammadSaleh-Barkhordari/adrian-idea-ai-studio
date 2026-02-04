-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  description_fa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_fa TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  excerpt_fa TEXT,
  content TEXT NOT NULL,
  content_fa TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  featured_image TEXT,
  read_time INTEGER DEFAULT 5,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  views INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
-- Public can read categories
CREATE POLICY "Categories are viewable by everyone"
ON public.blog_categories
FOR SELECT
USING (true);

-- Only admins and editors can manage categories
CREATE POLICY "Admins can insert categories"
ON public.blog_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories"
ON public.blog_categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories"
ON public.blog_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blog_posts
-- Public can read published posts
CREATE POLICY "Published posts are viewable by everyone"
ON public.blog_posts
FOR SELECT
USING (status = 'published' OR auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users with roles can create posts
CREATE POLICY "Employees can create posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

-- Authors can update their own posts, admins can update all
CREATE POLICY "Authors can update their own posts"
ON public.blog_posts
FOR UPDATE
USING (
  auth.uid() = author_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Authors can delete their own drafts, admins can delete all
CREATE POLICY "Authors can delete their own drafts"
ON public.blog_posts
FOR DELETE
USING (
  (auth.uid() = author_id AND status = 'draft') OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create updated_at trigger
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.blog_categories (name, name_fa, slug, description, description_fa) VALUES
('News', 'اخبار', 'news', 'Latest news and updates', 'آخرین اخبار و به‌روزرسانی‌ها'),
('Insights', 'بینش', 'insights', 'Industry insights and analysis', 'بینش و تحلیل صنعت'),
('Case Studies', 'مطالعات موردی', 'case-studies', 'Real-world case studies', 'مطالعات موردی دنیای واقعی'),
('Tutorials', 'آموزش', 'tutorials', 'Step-by-step guides', 'راهنماهای گام به گام');