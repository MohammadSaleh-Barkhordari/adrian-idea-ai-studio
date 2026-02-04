import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MouseTrail from '@/components/MouseTrail';
import useSmoothScroll from '@/hooks/useSmoothScroll';
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { format as formatJalali } from 'date-fns-jalali';
import { enUS, faIR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  author_id: string | null;
  created_at: string;
  published_at: string | null;
  featured_image: string | null;
  view_count: number;
  category_id: string | null;
  meta_description: string | null;
  og_image: string | null;
  tags: string[] | null;
  keywords: string[] | null;
  language: string;
}

interface Category {
  id: string;
  name_en: string;
  name_fa: string;
}

const BlogPostPage = () => {
  const { language } = useLanguage();
  const langPrefix = language === 'en' ? '/en' : '';
  const locale = language === 'en' ? enUS : faIR;
  const isRTL = language === 'fa';
  useSmoothScroll();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const toPersianNumber = (num: string) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'fa') {
      const formatted = formatJalali(date, 'd MMMM yyyy');
      return toPersianNumber(formatted);
    }
    return format(date, 'PP', { locale });
  };

  useEffect(() => {
    if (!slug) return;
    fetchPost();
  }, [slug, language]);

  const fetchPost = async () => {
    setLoading(true);

    // Fetch post by slug and language
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('language', language)
      .single();

    if (postError || !postData) {
      console.error('Error fetching post:', postError);
      navigate('/blog');
      return;
    }

    setPost(postData);

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: (postData.view_count || 0) + 1 })
      .eq('id', postData.id);

    // Fetch category
    if (postData.category_id) {
      const { data: categoryData } = await supabase
        .from('blog_categories')
        .select('id, name_en, name_fa')
        .eq('id', postData.category_id)
        .single();
      
      if (categoryData) {
        setCategory(categoryData);
      }
    }

    // Fetch related posts
    const { data: relatedData } = await supabase
      .from('blog_posts')
      .select('id, slug, title, featured_image, excerpt')
      .eq('status', 'published')
      .eq('language', language)
      .neq('id', postData.id)
      .limit(2);

    if (relatedData) {
      setRelatedPosts(relatedData as BlogPost[]);
    }

    setLoading(false);
  };

  if (loading || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categoryName = category ? (isRTL ? category.name_fa : category.name_en) : '';
  const currentMetaDesc = post.meta_description || post.excerpt || '';
  const currentTags = post.tags || [];
  
  const ogImageUrl = post.og_image || post.featured_image || '';
  const currentUrl = `${window.location.origin}${langPrefix}/blog/${post.slug}`;

  // Schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": currentMetaDesc,
    "image": ogImageUrl,
    "datePublished": post.published_at,
    "dateModified": post.created_at,
    "publisher": {
      "@type": "Organization",
      "name": "Adrian Idea",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/adrian-idea-favicon-512.png`
      }
    },
    "keywords": post.keywords?.join(', '),
    "articleSection": categoryName,
    "wordCount": post.content.split(' ').length
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{post.title} | Adrian Idea</title>
        <meta name="title" content={`${post.title} | Adrian Idea`} />
        <meta name="description" content={currentMetaDesc} />
        {post.keywords && <meta name="keywords" content={post.keywords.join(', ')} />}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={currentMetaDesc} />
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
        <meta property="og:site_name" content="Adrian Idea" />
        <meta property="article:published_time" content={post.published_at || ''} />
        <meta property="article:section" content={categoryName} />
        {currentTags.map((tag, i) => (
          <meta key={i} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={post.title} />
        <meta property="twitter:description" content={currentMetaDesc} />
        {ogImageUrl && <meta property="twitter:image" content={ogImageUrl} />}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <MouseTrail />
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(`${langPrefix}/blog`)}
            className="mb-6"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180 ml-2' : 'mr-2'}`} />
            {isRTL ? 'بازگشت به بلاگ' : 'Back to Blog'}
          </Button>

          {/* Category Badge */}
          {category && (
            <Badge className="mb-4">
              {categoryName}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-12 rounded-2xl overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-xl text-muted-foreground mb-8 font-medium">
              {post.excerpt}
            </div>
          )}

          {/* Content */}
          <article 
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          {/* Tags */}
          {currentTags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {currentTags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t">
              <h2 className="text-2xl font-bold mb-8">
                {isRTL ? 'مقالات مرتبط' : 'Related Articles'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`${langPrefix}/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <div className="bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-all">
                      {relatedPost.featured_image && (
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-primary/5 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">
              {isRTL ? 'آماده شروع پروژه خود هستید؟' : 'Ready to Start Your Project?'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isRTL 
                ? 'با تیم ما تماس بگیرید تا در مورد نیازهای شما صحبت کنیم' 
                : "Get in touch with our team to discuss your needs"}
            </p>
            <Link to={`${langPrefix}/contact`}>
              <Button size="lg">
                {isRTL ? 'تماس با ما' : 'Contact Us'}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;