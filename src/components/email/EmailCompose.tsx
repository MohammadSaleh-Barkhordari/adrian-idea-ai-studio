import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Send, Save, X, Loader2, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PreloadedAttachment {
  name: string;
  url: string;
  storage_path: string;
  bucket?: string;
}

interface FileAttachment {
  file: File;
  name: string;
  size: number;
}

interface EmailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'reply' | 'forward';
  replyToEmail?: any;
  userId: string;
  userEmail: string;
  onSent: () => void;
  initialSubject?: string;
  initialBody?: string;
  initialBodyHtml?: string;
  initialAttachments?: PreloadedAttachment[];
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EmailCompose = ({
  isOpen, onClose, mode, replyToEmail, userId, userEmail, onSent,
  initialSubject, initialBody, initialBodyHtml, initialAttachments
}: EmailComposeProps) => {
  const [to, setTo] = useState('');
  const [toName, setToName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [sending, setSending] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [contacts, setContacts] = useState<{ email: string; name: string | null }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
  const [preloadedAttachments, setPreloadedAttachments] = useState<PreloadedAttachment[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    setFileAttachments([]);
    setBodyHtml('');

    if (mode === 'reply' && replyToEmail) {
      setTo(replyToEmail.from_email);
      setToName(replyToEmail.from_name || '');
      setSubject(`Re: ${replyToEmail.subject}`);
      const date = new Date(replyToEmail.created_at).toLocaleString();
      setBody(`\n\n--- Original Message ---\nFrom: ${replyToEmail.from_name || replyToEmail.from_email}\nDate: ${date}\n\n${replyToEmail.body_text || ''}`);
      setPreloadedAttachments([]);
    } else if (mode === 'forward' && replyToEmail) {
      setTo('');
      setToName('');
      setSubject(`Fwd: ${replyToEmail.subject}`);
      const date = new Date(replyToEmail.created_at).toLocaleString();
      setBody(`\n\n--- Forwarded Message ---\nFrom: ${replyToEmail.from_name || replyToEmail.from_email}\nDate: ${date}\nSubject: ${replyToEmail.subject}\n\n${replyToEmail.body_text || ''}`);
      setPreloadedAttachments([]);
    } else {
      // mode === 'new'
      setTo('');
      setToName('');
      setSubject(initialSubject || '');
      setBody(initialBody || '');
      setBodyHtml(initialBodyHtml || '');
      setPreloadedAttachments(initialAttachments || []);
    }
  }, [isOpen, mode, replyToEmail, initialSubject, initialBody, initialBodyHtml, initialAttachments]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: FileAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: `${file.name} is too large (max 10MB)`, variant: 'destructive' });
        continue;
      }
      newAttachments.push({ file, name: file.name, size: file.size });
    }
    setFileAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFileAttachment = (index: number) => {
    setFileAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removePreloadedAttachment = (index: number) => {
    setPreloadedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!to) { toast({ title: 'Please enter a recipient', variant: 'destructive' }); return; }
    setSending(true);
    try {
      // 1. Upload new file attachments to storage
      const uploadedAttachments: Array<{ filename: string; storage_path: string; bucket: string }> = [];
      for (const fa of fileAttachments) {
        const timestamp = Date.now();
        const storagePath = `${userId}/${timestamp}-${fa.name}`;
        const { error: upErr } = await supabase.storage
          .from('email-attachments')
          .upload(storagePath, fa.file);
        if (upErr) {
          console.error('Upload error:', upErr);
          toast({ title: `Failed to upload ${fa.name}`, variant: 'destructive' });
          continue;
        }
        uploadedAttachments.push({ filename: fa.name, storage_path: storagePath, bucket: 'email-attachments' });
      }

      // 2. Combine with preloaded
      const allAttachments = [
        ...uploadedAttachments,
        ...preloadedAttachments.map(pa => ({
          filename: pa.name,
          storage_path: pa.storage_path,
          bucket: pa.bucket || 'email-attachments',
        })),
      ];

      // 3. Build email body
      const finalHtml = bodyHtml || `<p>${body.replace(/\n/g, '<br/>')}</p>`;

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          to_name: toName || undefined,
          subject,
          body_html: finalHtml,
          body_text: body,
          from_email: userEmail,
          from_name: 'Adrian Idea',
          reply_to_id: replyToEmail?.id || undefined,
          attachments: allAttachments.length > 0 ? allAttachments : undefined,
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
        from_email: userEmail,
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
    if (to || subject || body || fileAttachments.length > 0) {
      setShowDiscard(true);
    } else {
      onClose();
    }
  };

  const totalAttachments = fileAttachments.length + preloadedAttachments.length;

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
              <Input value={userEmail} disabled className="bg-muted" />
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
                rows={10}
                placeholder="Write your message..."
                className="resize-none"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attach File
                </Button>
                {totalAttachments > 0 && (
                  <span className="text-xs text-muted-foreground">{totalAttachments} file(s)</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg,.pdf"
                multiple
                onChange={handleFileSelect}
              />

              {(fileAttachments.length > 0 || preloadedAttachments.length > 0) && (
                <div className="space-y-1 border border-border rounded-md p-2">
                  {preloadedAttachments.map((pa, i) => (
                    <div key={`pre-${i}`} className="flex items-center justify-between text-sm py-1 px-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{pa.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePreloadedAttachment(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {fileAttachments.map((fa, i) => (
                    <div key={`file-${i}`} className="flex items-center justify-between text-sm py-1 px-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{fa.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{formatFileSize(fa.size)}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFileAttachment(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
            <AlertDialogAction onClick={() => { setShowDiscard(false); setTo(''); setSubject(''); setBody(''); setFileAttachments([]); setPreloadedAttachments([]); onClose(); }}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmailCompose;
