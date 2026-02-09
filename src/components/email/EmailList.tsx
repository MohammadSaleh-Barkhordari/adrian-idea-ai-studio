import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, RefreshCw, Archive, Trash2, Mail, MailOpen, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { EmailFolder } from './EmailSidebar';

interface EmailListProps {
  folder: EmailFolder;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  userId: string;
  userEmail: string;
  refreshKey: number;
  onRefresh: () => void;
}

interface Email {
  id: string;
  from_email: string;
  from_name: string | null;
  to_email: string;
  to_name: string | null;
  subject: string;
  body_text: string | null;
  direction: string;
  status: string;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

const EmailList = ({ folder, searchQuery, onSearchChange, selectedEmailId, onSelectEmail, userId, userEmail, refreshKey, onRefresh }: EmailListProps) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchEmails = useCallback(async (append = false) => {
    setLoading(true);
    try {
      let query = supabase
        .from('emails')
        .select('id, from_email, from_name, to_email, to_name, subject, body_text, direction, status, is_read, is_starred, is_archived, is_deleted, created_at')
        .eq('user_id', userId);

      // Folder filters
      switch (folder) {
        case 'inbox':
          query = query.eq('direction', 'inbound').eq('is_deleted', false).eq('is_archived', false).eq('to_email', userEmail);
          break;
        case 'sent':
          query = query.eq('direction', 'outbound').eq('is_deleted', false).neq('status', 'draft');
          break;
        case 'drafts':
          query = query.eq('status', 'draft').eq('is_deleted', false);
          break;
        case 'starred':
          query = query.eq('is_starred', true).eq('is_deleted', false);
          break;
        case 'archive':
          query = query.eq('is_archived', true).eq('is_deleted', false);
          break;
        case 'trash':
          query = query.eq('is_deleted', true);
          break;
      }

      if (searchQuery) {
        query = query.or(`subject.ilike.%${searchQuery}%,from_email.ilike.%${searchQuery}%,body_text.ilike.%${searchQuery}%`);
      }

      const offset = append ? emails.length : 0;
      query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);

      const { data, error } = await query;
      if (error) throw error;

      const fetched = (data || []) as Email[];
      setEmails(prev => append ? [...prev, ...fetched] : fetched);
      setHasMore(fetched.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  }, [folder, searchQuery, userId, userEmail, emails.length]);

  useEffect(() => {
    fetchEmails();
  }, [folder, searchQuery, userId, refreshKey]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('email-list-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emails' }, (payload) => {
        const newEmail = payload.new as any;
        if (newEmail.user_id === userId) {
          fetchEmails();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const handleSelect = async (emailId: string) => {
    onSelectEmail(emailId);
    // Mark as read
    const email = emails.find(e => e.id === emailId);
    if (email && !email.is_read) {
      await supabase.from('emails').update({ is_read: true }).eq('id', emailId);
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, is_read: true } : e));
    }
  };

  const toggleStar = async (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
    const email = emails.find(em => em.id === emailId);
    if (!email) return;
    await supabase.from('emails').update({ is_starred: !email.is_starred }).eq('id', emailId);
    setEmails(prev => prev.map(em => em.id === emailId ? { ...em, is_starred: !em.is_starred } : em));
  };

  const toggleCheck = (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      next.has(emailId) ? next.delete(emailId) : next.add(emailId);
      return next;
    });
  };

  const bulkAction = async (action: 'archive' | 'delete' | 'read' | 'unread') => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const updates: Record<string, boolean> = {};
    if (action === 'archive') updates.is_archived = true;
    if (action === 'delete') updates.is_deleted = true;
    if (action === 'read') updates.is_read = true;
    if (action === 'unread') updates.is_read = false;

    await supabase.from('emails').update(updates).in('id', ids);
    setSelected(new Set());
    fetchEmails();
    toast({ title: `${ids.length} email(s) updated` });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`;
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const emptyMessages: Record<EmailFolder, string> = {
    inbox: 'Your inbox is empty',
    sent: 'No sent emails yet',
    drafts: 'No drafts',
    starred: 'No starred emails',
    archive: 'Archive is empty',
    trash: 'Trash is empty',
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Search bar */}
      <div className="p-2 border-b border-border flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onRefresh}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="p-2 border-b border-border flex gap-1 items-center bg-muted/50 text-sm">
          <span className="text-muted-foreground mr-2">{selected.size} selected</span>
          <Button variant="ghost" size="sm" onClick={() => bulkAction('archive')}><Archive className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => bulkAction('delete')}><Trash2 className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => bulkAction('read')}><MailOpen className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => bulkAction('unread')}><Mail className="h-3.5 w-3.5" /></Button>
        </div>
      )}

      {/* Email rows */}
      <div className="flex-1 overflow-y-auto">
        {!loading && emails.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <Mail className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">{emptyMessages[folder]}</p>
          </div>
        )}
        {emails.map(email => {
          const displayName = folder === 'sent' || folder === 'drafts'
            ? (email.to_name || email.to_email)
            : (email.from_name || email.from_email);
          const preview = email.body_text?.slice(0, 80) || '';
          return (
            <div
              key={email.id}
              onClick={() => handleSelect(email.id)}
              className={cn(
                'flex items-start gap-2 px-3 py-2.5 cursor-pointer border-b border-border/50 transition-colors',
                selectedEmailId === email.id ? 'bg-primary/5' : 'hover:bg-muted/50',
                !email.is_read && 'bg-primary/[0.02]'
              )}
            >
              <div className="pt-1" onClick={(e) => toggleCheck(e, email.id)}>
                <Checkbox checked={selected.has(email.id)} />
              </div>
              {!email.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-sm truncate', !email.is_read && 'font-semibold')}>{displayName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(email.created_at)}</span>
                </div>
                <p className={cn('text-sm truncate', !email.is_read ? 'text-foreground' : 'text-muted-foreground')}>{email.subject || '(no subject)'}</p>
                <p className="text-xs text-muted-foreground truncate">{preview}</p>
              </div>
              <button onClick={(e) => toggleStar(e, email.id)} className="pt-1 shrink-0">
                <Star className={cn('h-4 w-4', email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40')} />
              </button>
            </div>
          );
        })}
        {hasMore && (
          <div className="p-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => fetchEmails(true)} disabled={loading}>
              {loading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;
