import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

export interface ContactType {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  first_name_fa: string | null;
  last_name_fa: string | null;
  job_title: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  linkedin_url: string | null;
  contact_type: string | null;
  is_primary_contact: boolean | null;
  is_decision_maker: boolean | null;
  photo_url: string | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  customerId: string;
  contact?: ContactType | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CustomerContactForm = ({ customerId, contact, onSuccess, onCancel }: Props) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    first_name_fa: '',
    last_name_fa: '',
    job_title: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    linkedin_url: '',
    contact_type: 'business',
    is_primary_contact: false,
    is_decision_maker: false,
    photo_url: '',
    notes: '',
  });

  useEffect(() => {
    if (contact) {
      setForm({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        first_name_fa: contact.first_name_fa || '',
        last_name_fa: contact.last_name_fa || '',
        job_title: contact.job_title || '',
        department: contact.department || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        linkedin_url: contact.linkedin_url || '',
        contact_type: contact.contact_type || 'business',
        is_primary_contact: contact.is_primary_contact || false,
        is_decision_maker: contact.is_decision_maker || false,
        photo_url: contact.photo_url || '',
        notes: contact.notes || '',
      });
    }
  }, [contact]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `contacts/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('customer-logos').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('customer-logos').getPublicUrl(path);
      setForm(f => ({ ...f, photo_url: publicUrl }));
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast({ title: 'First name and last name are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = {
        customer_id: customerId,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        first_name_fa: form.first_name_fa.trim() || null,
        last_name_fa: form.last_name_fa.trim() || null,
        job_title: form.job_title.trim() || null,
        department: form.department.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        mobile: form.mobile.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        contact_type: form.contact_type,
        is_primary_contact: form.is_primary_contact,
        is_decision_maker: form.is_decision_maker,
        photo_url: form.photo_url || null,
        notes: form.notes.trim() || null,
      };

      if (contact) {
        const { error } = await supabase.from('customer_contacts').update(payload).eq('id', contact.id);
        if (error) throw error;
        toast({ title: 'Contact updated successfully' });
      } else {
        const { error } = await supabase.from('customer_contacts').insert({ ...payload, created_by: session?.user?.id });
        if (error) throw error;
        toast({ title: 'Contact added successfully' });
      }
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Error saving contact', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Photo */}
      <div className="flex items-center gap-4">
        {form.photo_url ? (
          <div className="relative">
            <img src={form.photo_url} alt="Contact" className="w-16 h-16 rounded-full object-cover" />
            <button type="button" onClick={() => setForm(f => ({ ...f, photo_url: '' }))} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        )}
        <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Contact photo'}</span>
      </div>

      {/* Names EN */}
      <div className="grid grid-cols-2 gap-3">
        <div><Label>First Name *</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required /></div>
        <div><Label>Last Name *</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required /></div>
      </div>

      {/* Names FA */}
      <div className="grid grid-cols-2 gap-3">
        <div><Label>First Name (FA)</Label><Input dir="rtl" value={form.first_name_fa} onChange={e => setForm(f => ({ ...f, first_name_fa: e.target.value }))} /></div>
        <div><Label>Last Name (FA)</Label><Input dir="rtl" value={form.last_name_fa} onChange={e => setForm(f => ({ ...f, last_name_fa: e.target.value }))} /></div>
      </div>

      {/* Job / Dept */}
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Job Title</Label><Input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} /></div>
        <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
        <div><Label>Mobile</Label><Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} /></div>
      </div>

      <div><Label>LinkedIn URL</Label><Input value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} /></div>

      {/* Contact Type */}
      <div>
        <Label>Contact Type</Label>
        <Select value={form.contact_type} onValueChange={v => setForm(f => ({ ...f, contact_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="executive">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_primary_contact} onCheckedChange={v => setForm(f => ({ ...f, is_primary_contact: v }))} />
          <Label>Primary Contact</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_decision_maker} onCheckedChange={v => setForm(f => ({ ...f, is_decision_maker: v }))} />
          <Label>Decision Maker</Label>
        </div>
      </div>

      <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}</Button>
      </div>
    </form>
  );
};

export default CustomerContactForm;
