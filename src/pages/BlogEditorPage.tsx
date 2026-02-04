import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Upload, Globe, Image as ImageIcon, Search, History } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/styles/quill-custom.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MediaLibrary from '@/components/MediaLibrary';
import BlogVersionHistory from '@/components/BlogVersionHistory';
import { ScrollArea } from '@/components/ui/scroll-area';
import DOMPurify from 'dompurify';

interface Category {
  id: string;
  name_en: string;
  name_fa: string;
  slug: string;
}

export default function BlogEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { language: contextLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;
  
  // Determine interface language from URL path
  const interfaceLanguage = location.pathname.includes('/en/') ? 'en' : contextLanguage;
  const isRTL = interfaceLanguage === 'fa';
  
  // Get post language from URL param or default to interface language
  const postLanguage = searchParams.get('lang') || interfaceLanguage;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaInsertType, setMediaInsertType] = useState<'featured' | 'content'>('featured');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'draft',
    featured_image: '',
    read_time: 5,
    meta_description: '',
    og_image: '',
    og_description: '',
    tags: [] as string[],
    keywords: [] as string[],
    scheduled_at: '',
    language: postLanguage,
  });

  useEffect(() => {
    checkAuth();
    fetchCategories();
    if (isEditMode) {
      fetchPost();
    }
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (formData.title || formData.content) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!roles) {
      navigate('/');
      return;
    }

    const { data: employee } = await supabase
      .from('employees')
      .select('name, surname')
      .eq('user_id', user.id)
      .maybeSingle();

    if (employee) {
      setAuthorName(`${employee.name} ${employee.surname}`);
    } else {
      setAuthorName(user.email?.split('@')[0] || 'Anonymous');
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name_en');
    
    setCategories(data || []);
  };

  const fetchPost = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate(`${location.pathname.includes('/en/') ? '/en' : ''}/dashboard/blog`);
    } else if (data) {
      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content,
        category_id: data.category_id || '',
        status: data.status,
        featured_image: data.featured_image || '',
        read_time: 5,
        meta_description: data.meta_description || '',
        og_image: data.og_image || data.featured_image || '',
        og_description: data.excerpt || '',
        tags: data.tags || [],
        keywords: data.keywords || [],
        scheduled_at: '',
        language: data.language,
      });
    }
    setLoading(false);
  };

  const generateSlug = (text: string) => {
    if (postLanguage === 'fa') {
      // For Persian, just replace spaces with hyphens
      return text.replace(/\s+/g, '-').trim();
    }
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: !isEditMode ? generateSlug(value) : prev.slug,
    }));
  };

  const handleAutoSave = async () => {
    if (!formData.title || !isEditMode) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const postData = {
      ...formData,
      author_id: user.id,
      status: 'draft',
    };

    await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id);
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'لطفاً یک فایل تصویری انتخاب کنید' : 'Please select an image file',
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    setUploading(false);

    if (uploadError) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: uploadError.message,
        variant: 'destructive',
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleImageUpload(file);
    if (url) {
      setFormData(prev => ({ ...prev, featured_image: url }));
      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'تصویر با موفقیت آپلود شد' : 'Image uploaded successfully',
      });
    }
  };

  const handleMediaLibrarySelect = (url: string) => {
    if (mediaInsertType === 'featured') {
      setFormData(prev => ({ ...prev, featured_image: url }));
    } else {
      // Insert into content at cursor position
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        const position = range ? range.index : quill.getLength();
        quill.insertEmbed(position, 'image', url);
      }
    }
    setShowMediaLibrary(false);
  };

  const openMediaLibrary = (type: 'featured' | 'content') => {
    setMediaInsertType(type);
    setShowMediaLibrary(true);
  };

  const handleRestoreVersion = (version: any) => {
    setFormData(prev => ({
      ...prev,
      title: version.title,
      content: version.content,
      excerpt: version.excerpt || '',
      featured_image: version.featured_image || '',
      meta_description: version.meta_description || '',
    }));
    toast({
      title: isRTL ? 'موفق' : 'Success',
      description: isRTL ? 'نسخه بازگردانی شد' : 'Version restored successfully',
    });
  };

  const handleSave = async (publish: boolean = false, schedule: boolean = false) => {
    // Validate all mandatory fields
    if (!formData.title || !formData.content || !formData.excerpt || 
        !formData.featured_image || !formData.meta_description || !formData.category_id) {
      const missingFields = [];
      if (!formData.title) missingFields.push(isRTL ? 'عنوان' : 'Title');
      if (!formData.excerpt) missingFields.push(isRTL ? 'خلاصه' : 'Excerpt');
      if (!formData.content) missingFields.push(isRTL ? 'محتوا' : 'Content');
      if (!formData.featured_image) missingFields.push(isRTL ? 'تصویر شاخص' : 'Featured Image');
      if (!formData.meta_description) missingFields.push(isRTL ? 'توضیحات متا' : 'Meta Description');
      if (!formData.category_id) missingFields.push(isRTL ? 'دسته‌بندی' : 'Category');
      
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL 
          ? `لطفاً فیلدهای الزامی را پر کنید: ${missingFields.join('، ')}` 
          : `Please fill in required fields: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    if (schedule && !formData.scheduled_at) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'لطفاً تاریخ زمان‌بندی را انتخاب کنید' : 'Please select a schedule date',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const postData = {
      ...formData,
      author_id: user?.id,
      status: publish ? 'published' : (schedule ? 'scheduled' : formData.status),
      published_at: publish ? new Date().toISOString() : null,
      og_image: formData.og_image || formData.featured_image,
    };

    let error;

    if (isEditMode) {
      const result = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id);
      error = result.error;
    } else {
      const result = await supabase
        .from('blog_posts')
        .insert([postData]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: isRTL ? 'موفقیت' : 'Success',
        description: isRTL 
          ? (publish ? 'پست منتشر شد' : 'پست ذخیره شد')
          : (publish ? 'Post published' : 'Post saved'),
      });
      navigate(`${location.pathname.includes('/en/') ? '/en' : ''}/dashboard/blog`);
    }
  };

  // Enhanced Quill modules configuration with comprehensive toolbar
  const quillModules = {
    toolbar: {
      container: [
        // Text formatting group
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': ['sans-serif', 'serif', 'monospace'] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        
        // Style formatting
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        
        // Color controls
        [{ 'color': [] }, { 'background': [] }],
        
        // Lists
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        
        // Text alignment and direction
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        
        // Blocks
        ['blockquote', 'code-block'],
        
        // Links and media
        ['link', 'image', 'video'],
        
        // Clear formatting
        ['clean']
      ],
      handlers: {
        image: () => openMediaLibrary('content'),
        video: handleVideoEmbed
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'script',
    'color', 'background',
    'list', 'bullet', 'check', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'clean'
  ];

  // Handle video embedding
  function handleVideoEmbed() {
    const url = prompt(isRTL ? 'آدرس ویدیو را وارد کنید (YouTube, Vimeo):' : 'Enter video URL (YouTube, Vimeo):');
    if (url) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        if (range) {
          quill.insertEmbed(range.index, 'video', url);
          quill.setSelection({ index: range.index + 1, length: 0 });
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(`${location.pathname.includes('/en/') ? '/en' : ''}/dashboard/blog`)}
              className="mb-4"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180 ml-2' : 'mr-2'}`} />
              {isRTL ? 'بازگشت' : 'Back'}
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">
                {isEditMode 
                  ? (isRTL ? 'ویرایش پست' : 'Edit Post')
                  : (isRTL ? 'پست جدید' : 'New Post')
                }
              </h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {postLanguage === 'fa' ? 'فارسی' : 'English'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditMode && (
              <Button variant="outline" onClick={() => setShowVersionHistory(true)} disabled={loading}>
                <History className="h-4 w-4 mr-2" />
                {isRTL ? 'تاریخچه' : 'History'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowPreview(true)} disabled={loading}>
              <Eye className="h-4 w-4 mr-2" />
              {isRTL ? 'پیش‌نمایش' : 'Preview'}
            </Button>
            <Button variant="outline" onClick={() => handleSave(false, false)} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {isRTL ? 'ذخیره پیش‌نویس' : 'Save Draft'}
            </Button>
            {formData.scheduled_at && (
              <Button variant="secondary" onClick={() => handleSave(false, true)} disabled={loading}>
                {isRTL ? 'زمان‌بندی' : 'Schedule'}
              </Button>
            )}
            <Button onClick={() => handleSave(true, false)} disabled={loading}>
              {isRTL ? 'انتشار فوری' : 'Publish Now'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">{isRTL ? 'عنوان' : 'Title'} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={isRTL ? 'عنوان پست را وارد کنید' : 'Enter post title'}
              className="text-2xl font-bold"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">{isRTL ? 'نامک (URL)' : 'Slug (URL)'} *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder={isRTL ? 'نامک-url' : 'post-url-slug'}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isRTL 
                ? `آدرس کامل: /${postLanguage}/blog/${formData.slug || 'نامک'}` 
                : `Full URL: /${postLanguage}/blog/${formData.slug || 'slug'}`}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">{isRTL ? 'خلاصه' : 'Excerpt'} *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder={isRTL ? 'توضیح کوتاه درباره پست' : 'Brief description of the post'}
              rows={3}
            />
          </div>

          {/* Content Editor */}
          <div>
            <Label htmlFor="content">{isRTL ? 'محتوا' : 'Content'} *</Label>
            <div className="bg-background border rounded-md overflow-hidden" dir={postLanguage === 'fa' ? 'rtl' : 'ltr'}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder={isRTL ? 'محتوای پست خود را اینجا بنویسید...' : 'Write your post content here...'}
                modules={quillModules}
                formats={quillFormats}
                className={`min-h-[400px] ${postLanguage === 'fa' ? 'rtl-editor' : 'ltr-editor'}`}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isRTL 
                ? 'از نوار ابزار برای قالب‌بندی متن استفاده کنید. برای وارد کردن تصویر، روی آیکون تصویر کلیک کنید.'
                : 'Use the toolbar to format your text. Click the image icon to insert images from the media library.'}
            </p>
          </div>

          {/* Category and Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category">{isRTL ? 'دسته‌بندی' : 'Category'} *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'انتخاب دسته‌بندی' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {isRTL ? cat.name_fa : cat.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="read_time">{isRTL ? 'زمان مطالعه (دقیقه)' : 'Read Time (minutes)'}</Label>
              <Input
                id="read_time"
                type="number"
                value={formData.read_time}
                onChange={(e) => setFormData(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                min="1"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <Label htmlFor="featured_image">{isRTL ? 'تصویر شاخص' : 'Featured Image'} *</Label>
            <div className="flex gap-2">
              <Input
                id="featured_image"
                value={formData.featured_image}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => openMediaLibrary('featured')}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {isRTL ? 'کتابخانه' : 'Library'}
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? (isRTL ? 'در حال آپلود...' : 'Uploading...') : (isRTL ? 'آپلود' : 'Upload')}
                  </Button>
                </label>
              </div>
            </div>
            {formData.featured_image && (
              <div className="mt-2">
                <img 
                  src={formData.featured_image} 
                  alt="Featured" 
                  className="w-full max-w-md h-48 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="h-5 w-5" />
              {isRTL ? 'سئو و متاداده' : 'SEO & Metadata'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="meta_description">{isRTL ? 'توضیحات متا' : 'Meta Description'} *</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder={isRTL ? 'توضیح کوتاه برای موتورهای جستجو (حداکثر 160 کاراکتر)' : 'Brief description for search engines (160 characters max)'}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.meta_description.length}/160 {isRTL ? 'کاراکتر' : 'characters'}
                </p>
              </div>

              <div>
                <Label htmlFor="og_description">{isRTL ? 'توضیحات شبکه‌های اجتماعی' : 'OG Description (Social Media)'}</Label>
                <Textarea
                  id="og_description"
                  value={formData.og_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, og_description: e.target.value }))}
                  placeholder={isRTL ? 'توضیحات برای اشتراک‌گذاری در شبکه‌های اجتماعی' : 'Description for social media shares'}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tags">{isRTL ? 'برچسب‌ها (با کاما جدا شوند)' : 'Tags (comma-separated)'}</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  }))}
                  placeholder={isRTL ? 'هوش مصنوعی، یادگیری ماشین، فناوری' : 'AI, Machine Learning, Technology'}
                />
              </div>

              <div>
                <Label htmlFor="keywords">{isRTL ? 'کلمات کلیدی (با کاما جدا شوند)' : 'Keywords (comma-separated)'}</Label>
                <Input
                  id="keywords"
                  value={formData.keywords.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                  }))}
                  placeholder="artificial intelligence, business, growth"
                />
              </div>

              <div>
                <Label htmlFor="og_image">{isRTL ? 'تصویر شبکه‌های اجتماعی' : 'OG Image (Social Media)'}</Label>
                <Input
                  id="og_image"
                  value={formData.og_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, og_image: e.target.value }))}
                  placeholder="https://example.com/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? 'خالی بگذارید تا از تصویر شاخص استفاده شود' : 'Leave empty to use featured image'}
                </p>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-4">
              {isRTL ? 'زمان‌بندی انتشار' : 'Schedule Publishing'}
            </h3>
            <div>
              <Label htmlFor="scheduled_at">{isRTL ? 'تاریخ و زمان انتشار' : 'Publish Date & Time'}</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL ? 'برای انتشار فوری خالی بگذارید' : 'Leave empty to publish immediately'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Enhanced Preview Dialog - Shows post as it will appear on blog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {isRTL ? 'پیش‌نمایش پست' : 'Live Preview'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[75vh] px-6">
            <article className="space-y-6 py-6" dir={postLanguage === 'fa' ? 'rtl' : 'ltr'}>
              {/* Featured Image */}
              {formData.featured_image && (
                <div className="relative w-full h-96 rounded-xl overflow-hidden">
                  <img 
                    src={formData.featured_image} 
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Header */}
              <header className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight">
                  {formData.title || (isRTL ? 'عنوان پست' : 'Post Title')}
                </h1>
                
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="font-medium">{authorName || (isRTL ? 'نویسنده' : 'Author')}</span>
                  <span>•</span>
                  <span>{formData.read_time} {isRTL ? 'دقیقه مطالعه' : 'min read'}</span>
                  {formData.category_id && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary">
                        {isRTL ? categories.find(c => c.id === formData.category_id)?.name_fa : categories.find(c => c.id === formData.category_id)?.name_en || 'Category'}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Excerpt */}
                {formData.excerpt && (
                  <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-4">
                    {formData.excerpt}
                  </p>
                )}

                {/* Tags */}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              {/* Post Content */}
              <div 
                className="prose prose-lg max-w-none dark:prose-invert
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                  prose-p:leading-relaxed prose-p:text-foreground
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                  prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-muted prose-pre:border
                  prose-img:rounded-lg prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content || (isRTL ? '<p>محتوای پست اینجا نمایش داده می‌شود...</p>' : '<p>Post content will be displayed here...</p>')) }}
              />

              {/* Post Footer */}
              <footer className="pt-8 mt-8 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'نوشته شده توسط' : 'Written by'} <strong>{authorName}</strong>
                  </p>
                  {formData.scheduled_at && (
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'زمان انتشار:' : 'Scheduled for:'} {new Date(formData.scheduled_at).toLocaleString(postLanguage === 'fa' ? 'fa-IR' : 'en-US')}
                    </p>
                  )}
                </div>
              </footer>
            </article>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Media Library */}
      <MediaLibrary
        open={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaLibrarySelect}
        language={postLanguage as 'en' | 'fa'}
      />

      {/* Version History */}
      {isEditMode && id && (
        <BlogVersionHistory
          open={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          postId={id}
          onRestore={handleRestoreVersion}
          language={interfaceLanguage as 'en' | 'fa'}
        />
      )}
    </div>
  );
}
