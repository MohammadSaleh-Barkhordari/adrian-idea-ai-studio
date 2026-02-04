import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, RotateCcw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import DOMPurify from 'dompurify';

interface Version {
  id: string;
  version_number: number;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  meta_description: string | null;
  created_at: string;
  change_summary: string | null;
}

interface BlogVersionHistoryProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  onRestore: (version: Version) => void;
  language: 'en' | 'fa';
}

export default function BlogVersionHistory({
  open,
  onClose,
  postId,
  onRestore,
  language,
}: BlogVersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const { toast } = useToast();
  const isRTL = language === 'fa';

  const texts = {
    title: isRTL ? 'تاریخچه نسخه‌ها' : 'Version History',
    version: isRTL ? 'نسخه' : 'Version',
    current: isRTL ? 'فعلی' : 'Current',
    restore: isRTL ? 'بازگردانی' : 'Restore',
    preview: isRTL ? 'پیش‌نمایش' : 'Preview',
    close: isRTL ? 'بستن' : 'Close',
    noVersions: isRTL ? 'هنوز نسخه‌ای ذخیره نشده' : 'No versions saved yet',
    restoreConfirm: isRTL ? 'آیا می‌خواهید این نسخه را بازگردانی کنید?' : 'Do you want to restore this version?',
    restoreSuccess: isRTL ? 'نسخه بازگردانی شد' : 'Version restored',
    loading: isRTL ? 'در حال بارگذاری...' : 'Loading...',
  };

  useEffect(() => {
    if (open && postId) {
      fetchVersions();
    }
  }, [open, postId]);

  const fetchVersions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_versions')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Map data to match the Version interface, adding missing optional fields
      const mappedVersions: Version[] = (data || []).map((v: any) => ({
        id: v.id,
        version_number: v.version_number,
        title: v.title,
        content: v.content,
        excerpt: v.excerpt,
        featured_image: null,
        meta_description: null,
        created_at: v.created_at,
        change_summary: null,
      }));
      setVersions(mappedVersions);
    }
    setLoading(false);
  };

  const handleRestore = (version: Version) => {
    if (confirm(texts.restoreConfirm)) {
      onRestore(version);
      toast({
        title: texts.restoreSuccess,
        description: `${texts.version} ${version.version_number}`,
      });
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isRTL) {
      // For Persian, use Persian calendar formatting
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {texts.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh]">
          {/* Version List */}
          <ScrollArea className="h-full border rounded-lg p-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {texts.loading}
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {texts.noVersions}
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          {texts.version} {version.version_number}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="outline">{texts.current}</Badge>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mb-1 truncate">
                      {version.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {formatDate(version.created_at)}
                    </p>
                    {version.change_summary && (
                      <p className="text-xs text-muted-foreground italic">
                        {version.change_summary}
                      </p>
                    )}
                    {index !== 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version);
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        {texts.restore}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Version Preview */}
          <ScrollArea className="h-full border rounded-lg p-4">
            {selectedVersion ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {selectedVersion.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {formatDate(selectedVersion.created_at)}
                  </p>
                </div>

                {selectedVersion.featured_image && (
                  <img
                    src={selectedVersion.featured_image}
                    alt={selectedVersion.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                {selectedVersion.excerpt && (
                  <div>
                    <h4 className="font-semibold mb-1">{isRTL ? 'خلاصه:' : 'Excerpt:'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedVersion.excerpt}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">{isRTL ? 'محتوا:' : 'Content:'}</h4>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedVersion.content) }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{isRTL ? 'یک نسخه را انتخاب کنید' : 'Select a version to preview'}</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {texts.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
