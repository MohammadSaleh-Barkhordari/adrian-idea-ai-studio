import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload } from 'lucide-react';

interface Customer {
  id: string;
  company_name: string;
  company_name_fa: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  customer_status: string;
  contract_type: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  monthly_value: number | null;
  currency: string | null;
  logo_url: string | null;
  brand_color: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  notes: string | null;
  tags: string[] | null;
  account_manager_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface EmployeeOption {
  id: string;
  name: string;
  surname: string;
}

const INDUSTRIES = ['Automotive', 'Technology', 'FMCG', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Services', 'Other'];

const CustomerForm = ({ customer, onSuccess, onCancel }: CustomerFormProps) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    company_name_fa: '',
    industry: '',
    company_size: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Iran',
    customer_status: 'lead',
    contract_type: '',
    contract_start_date: '',
    contract_end_date: '',
    monthly_value: '',
    currency: 'IRR',
    logo_url: '',
    brand_color: '',
    linkedin_url: '',
    instagram_url: '',
    notes: '',
    tags: '',
    account_manager_id: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    const loadEmployees = async () => {
      const { data } = await supabase
        .from('employees')
        .select('id, name, surname')
        .eq('status', 'active')
        .order('name');
      if (data) setEmployees(data);
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    if (customer) {
      setFormData({
        company_name: customer.company_name || '',
        company_name_fa: customer.company_name_fa || '',
        industry: customer.industry || '',
        company_size: customer.company_size || '',
        website: customer.website || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || 'Iran',
        customer_status: customer.customer_status || 'lead',
        contract_type: customer.contract_type || '',
        contract_start_date: customer.contract_start_date || '',
        contract_end_date: customer.contract_end_date || '',
        monthly_value: customer.monthly_value != null ? customer.monthly_value.toString() : '',
        currency: customer.currency || 'IRR',
        logo_url: customer.logo_url || '',
        brand_color: customer.brand_color || '',
        linkedin_url: customer.linkedin_url || '',
        instagram_url: customer.instagram_url || '',
        notes: customer.notes || '',
        tags: customer.tags?.join(', ') || '',
        account_manager_id: customer.account_manager_id || '',
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('No authenticated user');

      let logoUrl = formData.logo_url;

      if (logoFile) {
        const filePath = `logos/${Date.now()}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('customer-logos')
          .upload(filePath, logoFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('customer-logos')
            .getPublicUrl(filePath);
          logoUrl = urlData.publicUrl;
        }
      }

      const tags = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const customerData = {
        company_name: formData.company_name,
        company_name_fa: formData.company_name_fa || null,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        website: formData.website || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || null,
        customer_status: formData.customer_status,
        contract_type: formData.contract_type || null,
        contract_start_date: formData.contract_start_date || null,
        contract_end_date: formData.contract_end_date || null,
        monthly_value: formData.monthly_value ? parseFloat(formData.monthly_value) : null,
        currency: formData.currency || null,
        logo_url: logoUrl || null,
        brand_color: formData.brand_color || null,
        linkedin_url: formData.linkedin_url || null,
        instagram_url: formData.instagram_url || null,
        notes: formData.notes || null,
        tags,
        account_manager_id: formData.account_manager_id || null,
      };

      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert({ ...customerData, created_by: currentUser.data.user.id });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Customer ${customer ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${customer ? 'update' : 'create'} customer`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollArea className="max-h-[70vh]">
      <form onSubmit={handleSubmit} className="space-y-6 pr-4">
        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name (EN) *</Label>
                <Input id="company_name" value={formData.company_name} onChange={e => update('company_name', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="company_name_fa">Company Name (FA)</Label>
                <Input id="company_name_fa" value={formData.company_name_fa} onChange={e => update('company_name_fa', e.target.value)} dir="rtl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Industry</Label>
                <Select value={formData.industry} onValueChange={v => update('industry', v)}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Company Size</Label>
                <Select value={formData.company_size} onValueChange={v => update('company_size', v)}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={formData.website} onChange={e => update('website', e.target.value)} placeholder="https://" />
              </div>
              <div>
                <Label htmlFor="c_email">Email</Label>
                <Input id="c_email" type="email" value={formData.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="c_phone">Phone</Label>
                <Input id="c_phone" value={formData.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={e => update('address', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={e => update('city', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} onChange={e => update('country', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input id="linkedin" value={formData.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input id="instagram" value={formData.instagram_url} onChange={e => update('instagram_url', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <Input id="logo" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                {formData.logo_url && <p className="text-xs text-muted-foreground mt-1">Current logo uploaded</p>}
              </div>
              <div>
                <Label htmlFor="brand_color">Brand Color</Label>
                <Input id="brand_color" type="color" value={formData.brand_color || '#000000'} onChange={e => update('brand_color', e.target.value)} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Relationship */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business Relationship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Status *</Label>
                <Select value={formData.customer_status} onValueChange={v => update('customer_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contract Type</Label>
                <Select value={formData.contract_type} onValueChange={v => update('contract_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_based">Project Based</SelectItem>
                    <SelectItem value="retainer">Retainer</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="one_time">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_start">Contract Start</Label>
                <Input id="contract_start" type="date" value={formData.contract_start_date} onChange={e => update('contract_start_date', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="contract_end">Contract End</Label>
                <Input id="contract_end" type="date" value={formData.contract_end_date} onChange={e => update('contract_end_date', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly_value">Monthly Value</Label>
                <Input id="monthly_value" type="number" value={formData.monthly_value} onChange={e => update('monthly_value', e.target.value)} />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={formData.currency} onValueChange={v => update('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IRR">IRR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Account Manager</Label>
              <Select value={formData.account_manager_id} onValueChange={v => update('account_manager_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select account manager" /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} {emp.surname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" value={formData.tags} onChange={e => update('tags', e.target.value)} placeholder="vip, automotive, tehran" />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={e => update('notes', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : customer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};

export default CustomerForm;
