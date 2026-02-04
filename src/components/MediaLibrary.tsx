import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDropzone } from 'react-dropzone';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Search, 
  Trash2, 
  CheckCircle, 
  Loader2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MediaItem {
  name: string;
  id: string;
  url: string;
  created_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  language: 'en' | 'fa';
}

export default function MediaLibrary({ 
  open, 
  onClose, 
  onSelect,
  language 
}: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const { toast } = useToast();
  const isRTL = language === 'fa';

  const texts = {
    title: isRTL ? 'کتابخانه رسانه' : 'Media Library',
    upload: isRTL ? 'آپلود' : 'Upload',
    library: isRTL ? 'کتابخانه' : 'Library',
    search: isRTL ? 'جستجو...' : 'Search...',
    uploadNew: isRTL ? 'آپلود فایل جدید' : 'Upload New Files',
    dragDrop: isRTL ? 'فایل‌ها را اینجا بکشید یا کلیک کنید' : 'Drag & drop files here or click to browse',
    selectImage: isRTL ? 'انتخاب تصویر' : 'Select Image',
    delete: isRTL ? 'حذف' : 'Delete',
    close: isRTL ? 'بستن' : 'Close',
    imageDetails: isRTL ? 'جزئیات تصویر' : 'Image Details',
    fileName: isRTL ? 'نام فایل' : 'File Name',
    uploadDate: isRTL ? 'تاریخ آپلود' : 'Upload Date',
    size: isRTL ? 'حجم' : 'Size',
    url: isRTL ? 'آدرس' : 'URL',
    copyUrl: isRTL ? 'کپی آدرس' : 'Copy URL',
    noImages: isRTL ? 'تصویری یافت نشد' : 'No images found',
    uploadSuccess: isRTL ? 'تصویر با موفقیت آپلود شد' : 'Image uploaded successfully',
    deleteSuccess: isRTL ? 'تصویر حذف شد' : 'Image deleted',
    deleteConfirm: isRTL ? 'آیا از حذف این تصویر مطمئن هستید؟' : 'Are you sure you want to delete this image?',
    error: isRTL ? 'خطا' : 'Error',
    onlyImages: isRTL ? 'فقط فایل‌های تصویری مجاز هستند' : 'Only image files are allowed',
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredMedia(
        media.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredMedia(media);
    }
  }, [searchTerm, media]);

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from('blog-images')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      toast({
        title: texts.error,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      const mediaItems = data.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(file.name);
        
        return {
          name: file.name,
          id: file.id,
          url: publicUrl,
          created_at: file.created_at,
          metadata: file.metadata,
        };
      });
      setMedia(mediaItems);
    }
    setLoading(false);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: texts.error,
          description: texts.onlyImages,
          variant: 'destructive',
        });
        continue;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: texts.error,
          description: uploadError.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: texts.uploadSuccess,
        });
      }
    }

    setUploading(false);
    fetchMedia();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    multiple: true
  });

  const handleDelete = async (fileName: string) => {
    if (!confirm(texts.deleteConfirm)) return;

    const { error } = await supabase.storage
      .from('blog-images')
      .remove([fileName]);

    if (error) {
      toast({
        title: texts.error,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: texts.deleteSuccess,
      });
      fetchMedia();
      if (selectedImage?.name === fileName) {
        setSelectedImage(null);
      }
    }
  };

  const handleSelect = (item: MediaItem) => {
    if (onSelect) {
      onSelect(item.url);
      onClose();
    } else {
      setSelectedImage(item);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: texts.copyUrl,
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{texts.title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">{texts.library}</TabsTrigger>
            <TabsTrigger value="upload">{texts.upload}</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={texts.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>

            {/* Image Grid */}
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p>{texts.noImages}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 hover:border-primary cursor-pointer transition-all"
                      onClick={() => handleSelect(item)}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {onSelect && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(item);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.name);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {selectedImage?.id === item.id && (
                        <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Image Details */}
            {selectedImage && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{texts.imageDetails}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Label className="text-muted-foreground">{texts.fileName}</Label>
                    <p className="truncate">{selectedImage.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{texts.uploadDate}</Label>
                    <p>{new Date(selectedImage.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{texts.size}</Label>
                    <p>{formatFileSize(selectedImage.metadata?.size)}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">{texts.url}</Label>
                    <div className="flex gap-2">
                      <Input value={selectedImage.url} readOnly className="text-xs" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(selectedImage.url)}
                      >
                        {texts.copyUrl}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
                ${uploading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                {uploading ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
                <div>
                  <p className="text-lg font-medium mb-2">{texts.uploadNew}</p>
                  <p className="text-sm text-muted-foreground">{texts.dragDrop}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG, GIF, WebP, SVG (Max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {texts.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
