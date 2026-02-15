import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  { value: 'ai_tools', label: 'AI Tools' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'communication', label: 'Communication' },
  { value: 'project_management', label: 'Project Management' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'cloud_hosting', label: 'Cloud & Hosting' },
  { value: 'video_production', label: 'Video Production' },
  { value: 'storage', label: 'Storage' },
  { value: '3d_modeling', label: '3D Modeling' },
  { value: 'other', label: 'Other' },
];

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'lifetime', label: 'Lifetime' },
  { value: 'free', label: 'Free' },
  { value: 'pay_as_you_go', label: 'Pay As You Go' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'IRR', label: 'IRR (﷼)' },
];

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
  { value: 'paused', label: 'Paused' },
  { value: 'free_tier', label: 'Free Tier' },
];

const TEAMS = ['management', 'marketing', 'development', 'design', 'sales', 'hr', 'finance', 'operations'];

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: any;
  onSaved: () => void;
}

const SubscriptionForm = ({ open, onOpenChange, subscription, onSaved }: SubscriptionFormProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  const defaultForm = {
    app_name: '', app_name_fa: '', logo_url: '', website_url: '',
    category: 'other', purpose: '', purpose_fa: '', used_by_teams: [] as string[],
    billing_cycle: 'monthly', cost_per_cycle: '', currency: 'USD',
    payment_day: '', reset_day: '', plan_name: '', max_seats: '', used_seats: '',
    usage_limit: '', usage_limit_fa: '', start_date: '', next_payment_date: '',
    expiry_date: '', status: 'active', auto_renew: true, login_email: '',
    login_method: '', account_owner_id: '', access_instructions: '',
    access_instructions_fa: '', notes: '', notes_fa: '', tags: '',
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (open) {
      if (subscription) {
        setForm({
          ...defaultForm,
          ...subscription,
          cost_per_cycle: subscription.cost_per_cycle?.toString() || '',
          payment_day: subscription.payment_day?.toString() || '',
          reset_day: subscription.reset_day?.toString() || '',
          max_seats: subscription.max_seats?.toString() || '',
          used_seats: subscription.used_seats?.toString() || '',
          used_by_teams: subscription.used_by_teams || [],
          tags: subscription.tags?.join(', ') || '',
          account_owner_id: subscription.account_owner_id || '',
        });
      } else {
        setForm(defaultForm);
      }
      fetchEmployees();
    }
  }, [open, subscription]);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('id, name, surname').eq('status', 'active').order('name');
    setEmployees(data || []);
  };

  const handleChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleTeam = (team: string) => {
    setForm(prev => ({
      ...prev,
      used_by_teams: prev.used_by_teams.includes(team)
        ? prev.used_by_teams.filter(t => t !== team)
        : [...prev.used_by_teams, team],
    }));
  };

  const handleSubmit = async () => {
    if (!form.app_name.trim()) {
      toast({ title: 'App name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload: any = {
        app_name: form.app_name,
        app_name_fa: form.app_name_fa || null,
        logo_url: form.logo_url || null,
        website_url: form.website_url || null,
        category: form.category,
        purpose: form.purpose || null,
        purpose_fa: form.purpose_fa || null,
        used_by_teams: form.used_by_teams,
        billing_cycle: form.billing_cycle,
        cost_per_cycle: form.cost_per_cycle ? parseFloat(form.cost_per_cycle) : null,
        currency: form.currency,
        payment_day: form.payment_day ? parseInt(form.payment_day) : null,
        reset_day: form.reset_day ? parseInt(form.reset_day) : null,
        plan_name: form.plan_name || null,
        max_seats: form.max_seats ? parseInt(form.max_seats) : null,
        used_seats: form.used_seats ? parseInt(form.used_seats) : null,
        usage_limit: form.usage_limit || null,
        usage_limit_fa: form.usage_limit_fa || null,
        start_date: form.start_date || null,
        next_payment_date: form.next_payment_date || null,
        expiry_date: form.expiry_date || null,
        status: form.status,
        auto_renew: form.auto_renew,
        login_email: form.login_email || null,
        login_method: form.login_method || null,
        account_owner_id: form.account_owner_id || null,
        access_instructions: form.access_instructions || null,
        access_instructions_fa: form.access_instructions_fa || null,
        notes: form.notes || null,
        notes_fa: form.notes_fa || null,
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      };

      if (subscription) {
        const { error } = await supabase.from('subscriptions').update(payload).eq('id', subscription.id);
        if (error) throw error;
        toast({ title: 'Subscription updated' });
      } else {
        payload.created_by = user?.id;
        const { error } = await supabase.from('subscriptions').insert(payload);
        if (error) throw error;
        toast({ title: 'Subscription added' });
      }
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving subscription:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="pt-2 pb-1"><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3><Separator className="mt-2" /></div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle>{subscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-4 pt-2">
            {/* Section 1: App Info */}
            <SectionHeader title="App Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>App Name (EN) *</Label><Input value={form.app_name} onChange={e => handleChange('app_name', e.target.value)} /></div>
              <div><Label>App Name (FA)</Label><Input value={form.app_name_fa} onChange={e => handleChange('app_name_fa', e.target.value)} dir="rtl" /></div>
              <div><Label>Website URL</Label><Input value={form.website_url} onChange={e => handleChange('website_url', e.target.value)} placeholder="https://..." /></div>
              <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={e => handleChange('logo_url', e.target.value)} placeholder="https://..." /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => handleChange('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Purpose (EN)</Label><Textarea value={form.purpose} onChange={e => handleChange('purpose', e.target.value)} rows={2} /></div>
            <div><Label>Purpose (FA)</Label><Textarea value={form.purpose_fa} onChange={e => handleChange('purpose_fa', e.target.value)} rows={2} dir="rtl" /></div>
            <div>
              <Label>Used By Teams</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                {TEAMS.map(team => (
                  <div key={team} className="flex items-center gap-2">
                    <Checkbox checked={form.used_by_teams.includes(team)} onCheckedChange={() => toggleTeam(team)} id={`team-${team}`} />
                    <label htmlFor={`team-${team}`} className="text-sm capitalize cursor-pointer">{team}</label>
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="e.g. essential, cloud" /></div>

            {/* Section 2: Billing */}
            <SectionHeader title="Billing" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Plan Name</Label><Input value={form.plan_name} onChange={e => handleChange('plan_name', e.target.value)} placeholder="e.g. Pro, Team" /></div>
              <div>
                <Label>Billing Cycle</Label>
                <Select value={form.billing_cycle} onValueChange={v => handleChange('billing_cycle', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BILLING_CYCLES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Cost per Cycle</Label><Input type="number" value={form.cost_per_cycle} onChange={e => handleChange('cost_per_cycle', e.target.value)} /></div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={v => handleChange('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Payment Day (1-31)</Label><Input type="number" min={1} max={31} value={form.payment_day} onChange={e => handleChange('payment_day', e.target.value)} /></div>
              <div><Label>Reset Day (1-31)</Label><Input type="number" min={1} max={31} value={form.reset_day} onChange={e => handleChange('reset_day', e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.auto_renew} onCheckedChange={v => handleChange('auto_renew', v)} id="auto-renew" />
              <Label htmlFor="auto-renew">Auto Renew</Label>
            </div>

            {/* Section 3: Access & Usage */}
            <SectionHeader title="Access & Usage" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => handleChange('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Max Seats</Label><Input type="number" value={form.max_seats} onChange={e => handleChange('max_seats', e.target.value)} /></div>
              <div><Label>Used Seats</Label><Input type="number" value={form.used_seats} onChange={e => handleChange('used_seats', e.target.value)} /></div>
              <div><Label>Login Email</Label><Input value={form.login_email} onChange={e => handleChange('login_email', e.target.value)} /></div>
              <div><Label>Login Method</Label><Input value={form.login_method} onChange={e => handleChange('login_method', e.target.value)} placeholder="e.g. Google SSO" /></div>
              <div>
                <Label>Account Owner</Label>
                <Select value={form.account_owner_id} onValueChange={v => handleChange('account_owner_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name} {emp.surname}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Usage Limit (EN)</Label><Input value={form.usage_limit} onChange={e => handleChange('usage_limit', e.target.value)} placeholder="e.g. 1000 messages/month" /></div>
            <div><Label>Usage Limit (FA)</Label><Input value={form.usage_limit_fa} onChange={e => handleChange('usage_limit_fa', e.target.value)} dir="rtl" /></div>
            <div><Label>Access Instructions (EN)</Label><Textarea value={form.access_instructions} onChange={e => handleChange('access_instructions', e.target.value)} rows={2} /></div>
            <div><Label>Access Instructions (FA)</Label><Textarea value={form.access_instructions_fa} onChange={e => handleChange('access_instructions_fa', e.target.value)} rows={2} dir="rtl" /></div>

            {/* Section 4: Dates */}
            <SectionHeader title="Dates" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => handleChange('start_date', e.target.value)} /></div>
              <div><Label>Next Payment Date</Label><Input type="date" value={form.next_payment_date} onChange={e => handleChange('next_payment_date', e.target.value)} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => handleChange('expiry_date', e.target.value)} /></div>
            </div>

            {/* Section 5: Notes */}
            <SectionHeader title="Notes" />
            <div><Label>Notes (EN)</Label><Textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} /></div>
            <div><Label>Notes (FA)</Label><Textarea value={form.notes_fa} onChange={e => handleChange('notes_fa', e.target.value)} rows={3} dir="rtl" /></div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : subscription ? 'Update' : 'Add Subscription'}</Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionForm;
