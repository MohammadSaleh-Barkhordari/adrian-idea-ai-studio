import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Reply, Forward, Archive, Trash2, Star, MailOpen, ArrowLeft, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';

interface EmailDetailProps {
  emailId: string | null;
  onReply: (email: any) => void;
  onForward: (email: any) => void;
  onBack: () => void;
  onRefresh: () => void;
}

const EmailDetail = ({ emailId, onReply, onForward, onBack, onRefresh }: EmailDetailProps) => {
  const [email, setEmail] = useState<any>(null);
  const [thread, setThread] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!emailId) { setEmail(null); setThread([]); return; }
    fetchEmail(emailId);
  }, [emailId]);

  const fetchEmail = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('emails').select('*').eq('id', id).maybeSingle();
    if (error || !data) { setLoading(false); return; }
    setEmail(data);

    // Fetch thread
    const threadEmails: any[] = [];
    let parentId = data.in_reply_to;
    let depth = 0;
    while (parentId && depth < 10) {
      const { data: parent } = await supabase.from('emails').select('*').eq('id', parentId).maybeSingle();
      if (!parent) break;
      threadEmails.push(parent);
      parentId = parent.in_reply_to;
      depth++;
    }
    setThread(threadEmails);
    setLoading(false);
  };

  const handleAction = async (action: 'archive' | 'delete' | 'star' | 'unread') => {
    if (!email) return;
    const updates: Record<string, any> = {};
    if (action === 'archive') updates.is_archived = true;
    if (action === 'delete') updates.is_deleted = true;
    if (action === 'star') updates.is_starred = !email.is_starred;
    if (action === 'unread') updates.is_read = false;

    await supabase.from('emails').update(updates).eq('id', email.id);

    if (action === 'star') {
      setEmail((prev: any) => ({ ...prev, is_starred: !prev.is_starred }));
    } else {
      toast({ title: action === 'archive' ? 'Archived' : action === 'delete' ? 'Moved to trash' : 'Marked unread' });
      onBack();
      onRefresh();
    }
  };

  if (!emailId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 opacity-30" />
        <p>Select an email to read</p>
      </div>
    );
  }

  if (loading || !email) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const formatFullDate = (d: string) => new Date(d).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  const renderBody = (e: any) => {
    if (e.body_html) {
      return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(e.body_html) }} className="prose prose-sm max-w-none dark:prose-invert" />;
    }
    return <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{e.body_text || ''}</pre>;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold flex-1 truncate">{email.subject || '(no subject)'}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">{email.from_name || email.from_email}</span>
            {email.from_name && <span className="ml-1">&lt;{email.from_email}&gt;</span>}
          </div>
          <span>→</span>
          <div>
            <span>{email.to_name || email.to_email}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{formatFullDate(email.created_at)}</div>

        {/* Actions */}
        <div className="flex gap-1 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => onReply(email)}><Reply className="h-4 w-4 mr-1" />Reply</Button>
          <Button variant="ghost" size="sm" onClick={() => onForward(email)}><Forward className="h-4 w-4 mr-1" />Forward</Button>
          <Button variant="ghost" size="sm" onClick={() => handleAction('archive')}><Archive className="h-4 w-4 mr-1" />Archive</Button>
          <Button variant="ghost" size="sm" onClick={() => handleAction('delete')}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
          <Button variant="ghost" size="sm" onClick={() => handleAction('star')}>
            <Star className={cn('h-4 w-4 mr-1', email.is_starred && 'fill-yellow-400 text-yellow-400')} />
            {email.is_starred ? 'Unstar' : 'Star'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleAction('unread')}><MailOpen className="h-4 w-4 mr-1" />Mark Unread</Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1">{renderBody(email)}</div>

      {/* Thread */}
      {thread.length > 0 && (
        <div className="border-t border-border p-4">
          <Accordion type="multiple">
            {thread.map((t, i) => (
              <AccordionItem key={t.id} value={t.id}>
                <AccordionTrigger className="text-sm text-muted-foreground">
                  Previous message from {t.from_name || t.from_email} — {new Date(t.created_at).toLocaleDateString()}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-xs text-muted-foreground mb-2">To: {t.to_email} · {formatFullDate(t.created_at)}</div>
                  {renderBody(t)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default EmailDetail;
