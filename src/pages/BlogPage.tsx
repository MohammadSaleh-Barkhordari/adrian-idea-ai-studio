import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MouseTrail from '@/components/MouseTrail';
import useSmoothScroll from '@/hooks/useSmoothScroll';
import { Calendar, ArrowRight, User, Clock, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { format as formatJalali } from 'date-fns-jalali';
import { enUS, faIR } from 'date-fns/locale';
import elecompImage from '@/assets/elecomp-2025-exhibition.png';

const BlogPage = () => {
  const { language, t } = useLanguage();
  const langPrefix = language === 'en' ? '/en' : '';
  const locale = language === 'en' ? enUS : faIR;
  useSmoothScroll();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t?.blog?.allCategory || 'All');

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

  const blogPosts = (t?.blog?.posts || []).map(post => {
    // Replace ELECOMP post image with the real exhibition photo
    if (post.slug === 'elecomp-2025-exhibition-analysis') {
      return {
        ...post,
        image: elecompImage,
        imageLarge: elecompImage
      };
    }
    return post;
  });

  const categories = [
    t?.blog?.allCategory || 'All',
    t?.blog?.categories?.aiStrategy || 'AI Strategy',
    t?.blog?.categories?.manufacturing || 'Manufacturing',
    t?.blog?.categories?.security || 'Security',
    t?.blog?.categories?.businessValue || 'Business Value',
    t?.blog?.categories?.healthcare || 'Healthcare',
    t?.blog?.categories?.ethics || 'Ethics'
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === (t?.blog?.allCategory || 'All') || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <MouseTrail />
      <Navigation />
      <main className="relative z-10 pt-20">
        <section className="">
          <div className="container mx-auto px-6 py-20">
            {/* Header */}
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple/10 border border-purple/20 text-purple text-sm font-medium mb-6">
                {t?.blog?.badge}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
                {t?.blog?.title}{' '}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  {t?.blog?.titleAccent}
                </span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                {t?.blog?.subtitle}
              </p>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t?.blog?.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent/50 bg-background/50"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-8 py-3 rounded-xl glass border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent/50 bg-background/50 appearance-none cursor-pointer"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`${langPrefix}/blog/${post.slug}`}
                  className="group bg-background/30 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-500 animate-slide-up"
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
                    {post.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gold text-white text-xs font-medium">
                          {t?.blog?.featured}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-display font-semibold mb-3 group-hover:text-accent transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="mt-4 flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-medium">{t?.blog?.readArticle}</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">{t?.blog?.noArticles}</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(t?.blog?.allCategory || 'All');
                  }}
                  className="mt-4 text-accent hover:text-accent/80 transition-colors"
                >
                  {t?.blog?.clearFilters}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;