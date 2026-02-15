import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { ContactType } from '@/components/CustomerContactForm';

interface Props {
  customerId: string;
  contacts: ContactType[];
  onSuccess: () => void;
  onCancel: () => void;
}

const interactionTypes = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'contract_signed', label: 'Contract Signed' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'note', label: 'Note' },
  { value: 'other', label: 'Other' },
];

const CustomerInteractionForm = ({ customerId, contacts, onSuccess, onCancel }: Props) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    interaction_type: 'meeting',
    contact_id: '',
    subject: '',
    description: '',
    interaction_date: new Date().toISOString().slice(0, 16),
    follow_up_date: '',
    follow_up_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.interaction_type) {
      toast({ title: 'Subject and interaction type are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('customer_interactions').insert({
        customer_id: customerId,
        interaction_type: form.interaction_type,
        contact_id: form.contact_id || null,
        subject: form.subject.trim(),
        description: form.description.trim() || null,
        interaction_date: new Date(form.interaction_date).toISOString(),
        follow_up_date: form.follow_up_date || null,
        follow_up_notes: form.follow_up_notes.trim() || null,
        created_by: session?.user?.id,
      });
      if (error) throw error;
      toast({ title: 'Interaction logged successfully' });
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Error logging interaction', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Interaction Type *</Label>
        <Select value={form.interaction_type} onValueChange={v => setForm(f => ({ ...f, interaction_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {interactionTypes.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {contacts.length > 0 && (
        <div>
          <Label>Contact (optional)</Label>
          <Select value={form.contact_id} onValueChange={v => setForm(f => ({ ...f, contact_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
            <SelectContent>
              {contacts.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required /></div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label>Interaction Date</Label><Input type="datetime-local" value={form.interaction_date} onChange={e => setForm(f => ({ ...f, interaction_date: e.target.value }))} /></div>
        <div><Label>Follow-up Date</Label><Input type="date" value={form.follow_up_date} onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))} /></div>
      </div>

      {form.follow_up_date && (
        <div><Label>Follow-up Notes</Label><Textarea value={form.follow_up_notes} onChange={e => setForm(f => ({ ...f, follow_up_notes: e.target.value }))} rows={2} /></div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Log Interaction'}</Button>
      </div>
    </form>
  );
};

export default CustomerInteractionForm;
