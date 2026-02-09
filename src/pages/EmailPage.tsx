import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import EmailSidebar, { type EmailFolder } from '@/components/email/EmailSidebar';
import EmailList from '@/components/email/EmailList';
import EmailDetail from '@/components/email/EmailDetail';
import EmailCompose from '@/components/email/EmailCompose';
import EmailQuickAdd from '@/components/email/EmailQuickAdd';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EmailPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // State
  const [activeFolder, setActiveFolder] = useState<EmailFolder>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [composeMode, setComposeMode] = useState<'new' | 'reply' | 'forward'>('new');
  const [replyToEmail, setReplyToEmail] = useState<any>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      setUserEmail(session.user.email || '');
      setLoading(false);
    };
    init();
  }, [navigate]);

  // Fetch unread count
  const fetchUnread = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('emails')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('direction', 'inbound')
      .eq('is_read', false)
      .eq('is_deleted', false)
      .eq('is_archived', false);
    setUnreadCount(count || 0);
  }, [user]);

  useEffect(() => { fetchUnread(); }, [fetchUnread, refreshKey]);

  // Realtime for notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('email-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emails' }, (payload) => {
        const email = payload.new as any;
        if (email.user_id === user.id && email.direction === 'inbound') {
          toast({ title: `New email from ${email.from_name || email.from_email}`, description: email.subject });
          fetchUnread();
          if (activeFolder === 'inbox') setRefreshKey(k => k + 1);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeFolder, fetchUnread, toast]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const handleCompose = () => {
    setComposeMode('new');
    setReplyToEmail(null);
    setIsComposing(true);
  };

  const handleReply = (email: any) => {
    setComposeMode('reply');
    setReplyToEmail(email);
    setIsComposing(true);
  };

  const handleForward = (email: any) => {
    setComposeMode('forward');
    setReplyToEmail(email);
    setIsComposing(true);
  };

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
  };

  const handleBack = () => {
    setSelectedEmailId(null);
    handleRefresh();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  // Mobile: show detail or list
  const showDetail = isMobile && selectedEmailId;
  const showList = !isMobile || !selectedEmailId;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div
        className={cn(
          'flex-1 flex overflow-hidden',
          'pt-16' // nav height offset
        )}
        style={{
          height: 'calc(100vh - 4rem)',
        }}
      >
        {/* Sidebar - hidden on mobile when detail is shown */}
        {(!isMobile || !selectedEmailId) && (
          <div className={cn('shrink-0', isMobile ? 'hidden' : 'w-[60px] md:w-[200px] lg:w-[240px]')}>
            <EmailSidebar
              activeFolder={activeFolder}
              onFolderChange={(f) => { setActiveFolder(f); setSelectedEmailId(null); }}
              onCompose={handleCompose}
              onQuickAdd={() => setShowQuickAdd(true)}
              unreadCount={unreadCount}
              collapsed={!isMobile && typeof window !== 'undefined' && window.innerWidth < 1024}
            />
          </div>
        )}

        {/* Email List */}
        {showList && !showDetail && (
          <div className={cn('flex-1 lg:flex-none lg:w-[380px]', isMobile && 'w-full')}>
            <EmailList
              folder={activeFolder}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              userId={user.id}
              userEmail={userEmail}
              refreshKey={refreshKey}
              onRefresh={handleRefresh}
            />
          </div>
        )}

        {/* Email Detail */}
        {(!isMobile || showDetail) && (
          <div className="flex-1 min-w-0">
            <EmailDetail
              emailId={selectedEmailId}
              onReply={handleReply}
              onForward={handleForward}
              onBack={handleBack}
              onRefresh={handleRefresh}
            />
          </div>
        )}
      </div>

      {/* Mobile bottom bar for compose + folder */}
      {isMobile && !selectedEmailId && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around safe-area-bottom z-40">
          {(['inbox', 'sent', 'starred', 'trash'] as EmailFolder[]).map(f => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={cn('p-2 rounded-md text-xs', activeFolder === f ? 'text-primary font-medium' : 'text-muted-foreground')}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button onClick={handleCompose} className="p-2 rounded-md text-xs text-primary font-medium">
            Compose
          </button>
        </div>
      )}

      <EmailCompose
        isOpen={isComposing}
        onClose={() => setIsComposing(false)}
        mode={composeMode}
        replyToEmail={replyToEmail}
        userId={user.id}
        userEmail={userEmail}
        onSent={handleRefresh}
      />

      <EmailQuickAdd
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        userId={user.id}
        userEmail={userEmail}
        onAdded={handleRefresh}
      />
    </div>
  );
};

export default EmailPage;
