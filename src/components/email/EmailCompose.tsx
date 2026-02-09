import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Send, Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'reply' | 'forward';
  replyToEmail?: any;
  userId: string;
  onSent: () => void;
}

const EmailCompose = ({ isOpen, onClose, mode, replyToEmail, userId, onSent }: EmailComposeProps) => {
  const [to, setTo] = useState('');
  const [toName, setToName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [contacts, setContacts] = useState<{ email: string; name: string | null }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'reply' && replyToEmail) {
      setTo(replyToEmail.from_email);
      setToName(replyToEmail.from_name || '');
      setSubject(`Re: ${replyToEmail.subject}`);
      const date = new Date(replyToEmail.created_at).toLocaleString();
      setBody(`\n\n--- Original Message ---\nFrom: ${replyToEmail.from_name || replyToEmail.from_email}\nDate: ${date}\n\n${replyToEmail.body_text || ''}`);
    } else if (mode === 'forward' && replyToEmail) {
      setTo('');
      setToName('');
      setSubject(`Fwd: ${replyToEmail.subject}`);
      const date = new Date(replyToEmail.created_at).toLocaleString();
      setBody(`\n\n--- Forwarded Message ---\nFrom: ${replyToEmail.from_name || replyToEmail.from_email}\nDate: ${date}\nSubject: ${replyToEmail.subject}\n\n${replyToEmail.body_text || ''}`);
    } else {
      setTo(''); setToName(''); setSubject(''); setBody('');
    }
  }, [isOpen, mode, replyToEmail]);

  const searchContacts = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) { setContacts([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('email_contacts')
        .select('email, name')
        .eq('user_id', userId)
        .ilike('email', `%${q}%`)
        .limit(5);
      setContacts(data || []);
      setShowSuggestions((data || []).length > 0);
    }, 300);
  };

  const handleSend = async () => {
    if (!to) { toast({ title: 'Please enter a recipient', variant: 'destructive' }); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          to_name: toName || undefined,
          subject,
          body_html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
          body_text: body,
          from_name: 'Adrian Idea',
          reply_to_id: replyToEmail?.id || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Email sent successfully' });
      onSent();
      onClose();
    } catch (err: any) {
      console.error('Send error:', err);
      toast({ title: 'Failed to send email', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await supabase.from('emails').insert({
        user_id: userId,
        from_email: 'noreply@send.adrianidea.ir',
        from_name: 'Adrian Idea',
        to_email: to || '',
        to_name: toName || null,
        subject: subject || '',
        body_text: body || null,
        body_html: body ? `<p>${body.replace(/\n/g, '<br/>')}</p>` : null,
        direction: 'outbound',
        status: 'draft',
        is_read: true,
        in_reply_to: replyToEmail?.id || null,
      });
      toast({ title: 'Draft saved' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Failed to save draft', description: err.message, variant: 'destructive' });
    }
  };

  const handleClose = () => {
    if (to || subject || body) {
      setShowDiscard(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {mode === 'reply' ? 'Reply' : mode === 'forward' ? 'Forward' : 'New Email'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 flex-1 overflow-y-auto">
            <div>
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input value="noreply@send.adrianidea.ir" disabled className="bg-muted" />
            </div>

            <div className="relative">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                value={to}
                onChange={(e) => { setTo(e.target.value); searchContacts(e.target.value); }}
                onFocus={() => contacts.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="recipient@example.com"
              />
              {showSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-y-auto">
                  {contacts.map((c) => (
                    <button
                      key={c.email}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onMouseDown={() => { setTo(c.email); setToName(c.name || ''); setShowSuggestions(false); }}
                    >
                      {c.name && <span className="font-medium">{c.name} </span>}
                      <span className="text-muted-foreground">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Body</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Write your message..."
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-border">
            <Button onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />Save Draft
            </Button>
            <Button variant="ghost" onClick={handleClose} className="ml-auto">
              <X className="h-4 w-4 mr-2" />Discard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard draft?</AlertDialogTitle>
            <AlertDialogDescription>Your unsaved changes will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowDiscard(false); setTo(''); setSubject(''); setBody(''); onClose(); }}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmailCompose;
