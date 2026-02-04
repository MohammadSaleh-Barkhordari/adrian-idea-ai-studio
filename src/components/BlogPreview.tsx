import { Calendar, ArrowRight, User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const BlogPreview = () => {
  const { language, t, isRTL } = useLanguage();
  const langPrefix = language === 'en' ? '/en' : '';
  
  const blogPosts = t?.blogPreview?.posts || [];

  return (
    <section className="">
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-purple text-sm font-medium mb-6">
            {t?.blogPreview?.badge || 'Latest Insights'}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            {t?.blogPreview?.title || 'From Our'}{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {t?.blogPreview?.titleAccent || 'Blog'}
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t?.blogPreview?.description || 'Stay ahead with the latest AI trends, insights, and best practices from our team of experts and industry thought leaders.'}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {blogPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`${langPrefix}/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-500 animate-slide-up bg-background/30 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  srcSet={`${post.image} 400w, ${post.imageLarge} 800w`}
                  sizes="(max-width: 768px) 100vw, 384px"
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  width="400"
                  height="200"
                  loading="lazy"
                />
                 <div className="absolute top-4 left-4">
                   <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent text-white text-xs font-medium">
                     {post.category}
                   </span>
                 </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-display font-semibold mb-3 group-hover:text-accent transition-colors duration-300 line-clamp-1">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2 text-sm">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Read More */}
                <div className={`flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-medium">{t?.blogPreview?.readMore || 'Read More'}</span>
                  <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} h-4 w-4 group-hover:translate-x-1 transition-transform duration-300`} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Link to={`${langPrefix}/blog`}>
            <button className="inline-flex items-center px-8 py-4 rounded-xl bg-background/50 backdrop-blur-sm text-accent hover:bg-accent hover:text-white transition-all duration-300 font-medium hover:shadow-glow">
              {t?.blogPreview?.viewAllArticles || 'View All Articles'}
              <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5`} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;