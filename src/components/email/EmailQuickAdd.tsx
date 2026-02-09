import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface EmailQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onAdded: () => void;
}

const EmailQuickAdd = ({ isOpen, onClose, userId, onAdded }: EmailQuickAddProps) => {
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!fromEmail || !subject) {
      toast({ title: 'From Email and Subject are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('emails').insert({
        user_id: userId,
        from_email: fromEmail,
        from_name: fromName || null,
        to_email: 'm.barkhordari@adrianidea.ir',
        subject,
        body_text: body || null,
        direction: 'inbound',
        status: 'received',
        is_read: false,
      });
      if (error) throw error;
      toast({ title: 'Email logged successfully' });
      setFromEmail(''); setFromName(''); setSubject(''); setBody('');
      onAdded();
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Incoming Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">From Email *</Label>
            <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="sender@example.com" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">From Name</Label>
            <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Sender Name" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Subject *</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Body</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Email content..." />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Log Email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailQuickAdd;
