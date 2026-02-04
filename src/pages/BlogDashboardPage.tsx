import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Copy,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  author_id: string | null;
  created_at: string;
  published_at: string | null;
  view_count: number;
  category_id: string | null;
  language: string;
}

interface Category {
  id: string;
  name_en: string;
  name_fa: string;
  slug: string;
}

export default function BlogDashboardPage() {
  const { language: contextLanguage, t, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Determine language from URL path
  const interfaceLanguage = location.pathname.includes('/en/') ? 'en' : 'fa';
  const isRTL = interfaceLanguage === 'fa';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'fa' | 'en'>('fa');

  useEffect(() => {
    checkAuth();
    fetchPosts();
    fetchCategories();
  }, [selectedLanguage]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: t.dashboard.blog.messages.unauthorized.split(' ')[0],
        description: t.nav.signIn,
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!roles) {
      toast({
        title: t.dashboard.blog.messages.unauthorized,
        description: t.dashboard.blog.messages.unauthorized,
        variant: 'destructive',
      });
      navigate('/');
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('language', selectedLanguage)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: t.dashboard.blog.messages.deleteError.split(' ')[0],
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('*')
      .order(selectedLanguage === 'fa' ? 'name_fa' : 'name_en');
    
    setCategories(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.dashboard.blog.actions.deleteConfirm)) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: t.dashboard.blog.messages.deleteError,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.dashboard.blog.messages.deleteSuccess,
        description: t.dashboard.blog.messages.deleteSuccess,
      });
      fetchPosts();
    }
  };

  const handleDuplicate = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch full post data
    const { data: originalPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !originalPost) {
      toast({
        title: t.dashboard.blog.messages.duplicateError,
        description: fetchError?.message || 'Post not found',
        variant: 'destructive',
      });
      return;
    }

    const duplicateData = {
      title: `${originalPost.title} (Copy)`,
      slug: `${originalPost.slug}-copy-${Date.now()}`,
      content: originalPost.content,
      excerpt: originalPost.excerpt,
      category_id: originalPost.category_id,
      status: 'draft',
      author_id: user.id,
      featured_image: originalPost.featured_image,
      language: originalPost.language,
      meta_description: originalPost.meta_description,
      og_image: originalPost.og_image,
      tags: originalPost.tags,
      keywords: originalPost.keywords,
    };

    const { error } = await supabase
      .from('blog_posts')
      .insert([duplicateData]);

    if (error) {
      toast({
        title: t.dashboard.blog.messages.duplicateError,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.dashboard.blog.messages.duplicateSuccess,
        description: t.dashboard.blog.messages.duplicateSuccess,
      });
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      published: 'default',
      scheduled: 'outline',
      archived: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20" dir="ltr">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {t.dashboard.blog.title}
            </h1>
            <p className="text-muted-foreground">
              {t.dashboard.title}
            </p>
          </div>
          
          {/* Language Toggle for Dashboard UI */}
          <Button
            variant="outline"
            onClick={() => {
              const newLang = interfaceLanguage === 'fa' ? 'en' : 'fa';
              const newPath = interfaceLanguage === 'fa' 
                ? '/en/dashboard/blog'
                : '/dashboard/blog';
              navigate(newPath);
            }}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {interfaceLanguage === 'fa' ? 'English' : 'فارسی'}
          </Button>
        </div>

        <Tabs value={selectedLanguage} onValueChange={(val) => setSelectedLanguage(val as 'fa' | 'en')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="fa" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.dashboard.blog.persianBlog}
            </TabsTrigger>
            <TabsTrigger value="en" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.dashboard.blog.englishBlog}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLanguage} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input
                  placeholder={t.dashboard.blog.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t.dashboard.blog.filterStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.dashboard.blog.status.all}</SelectItem>
                  <SelectItem value="draft">{t.dashboard.blog.status.draft}</SelectItem>
                  <SelectItem value="published">{t.dashboard.blog.status.published}</SelectItem>
                  <SelectItem value="scheduled">{t.dashboard.blog.status.scheduled}</SelectItem>
                  <SelectItem value="archived">{t.dashboard.blog.status.archived}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t.dashboard.blog.filterCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.dashboard.blog.allCategories}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {selectedLanguage === 'fa' ? cat.name_fa : cat.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => navigate(`${location.pathname.includes('/en/') ? '/en' : ''}/dashboard/blog/new?lang=${selectedLanguage}`)}>
                <Plus className="h-4 w-4 mr-2" />
                {t.dashboard.blog.createNew}
              </Button>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.dashboard.blog.table.title}</TableHead>
                    <TableHead>{t.dashboard.blog.table.author}</TableHead>
                    <TableHead>{t.dashboard.blog.table.status}</TableHead>
                    <TableHead>{t.dashboard.blog.table.views}</TableHead>
                    <TableHead>{t.dashboard.blog.table.date}</TableHead>
                    <TableHead className="text-right">{t.dashboard.blog.table.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {t.dashboard.blog.messages.loading}
                      </TableCell>
                    </TableRow>
                  ) : filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {t.dashboard.blog.messages.noResults}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{getStatusBadge(post.status)}</TableCell>
                        <TableCell>{post.view_count}</TableCell>
                        <TableCell>
                          {new Date(post.created_at).toLocaleDateString(selectedLanguage === 'fa' ? 'fa-IR' : 'en-US')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            {post.status === 'published' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/${selectedLanguage}/blog/${post.slug}`, '_blank')}
                                title={t.dashboard.blog.actions.view}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`${location.pathname.includes('/en/') ? '/en' : ''}/dashboard/blog/edit/${post.id}`)}
                              title={t.dashboard.blog.actions.edit}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(post.id)}
                              title={t.dashboard.blog.actions.duplicate}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(post.id)}
                              title={t.dashboard.blog.actions.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
