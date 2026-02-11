import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, Building2, Edit, Globe, Mail, Phone, MapPin, Users, MessageSquare,
  FileText, Briefcase, Calendar, ExternalLink, Plus, Trash2, CheckCircle,
  PhoneCall, UserCheck, Clock, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import CustomerForm from '@/components/CustomerForm';
import CustomerContactForm, { type ContactType } from '@/components/CustomerContactForm';
import CustomerInteractionForm from '@/components/CustomerInteractionForm';

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

interface Interaction {
  id: string;
  customer_id: string;
  contact_id: string | null;
  interaction_type: string;
  subject: string;
  description: string | null;
  interaction_date: string;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  is_completed: boolean | null;
  created_by: string | null;
  created_at: string;
}

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    lead: 'bg-blue-100 text-blue-800',
    prospect: 'bg-indigo-100 text-indigo-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    churned: 'bg-red-100 text-red-800',
  };
  return <Badge className={map[status] || ''}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

const formatCurrency = (value: number | null, currency: string | null) => {
  if (value == null) return '-';
  const sym: Record<string, string> = { IRR: 'IRR', USD: '$', EUR: '€', GBP: '£' };
  return `${sym[currency || 'IRR'] || currency} ${value.toLocaleString()}`;
};

const formatContractType = (t: string | null) => {
  if (!t) return '-';
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const interactionIcon = (type: string) => {
  switch (type) {
    case 'call': return <PhoneCall className="h-4 w-4" />;
    case 'meeting': return <Users className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'proposal': return <FileText className="h-4 w-4" />;
    case 'contract_signed': return <CheckCircle className="h-4 w-4" />;
    case 'invoice': return <Briefcase className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [managerName, setManagerName] = useState<string | null>(null);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  const [contactNames, setContactNames] = useState<Record<string, string>>({});

  // Dialogs
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactType | null>(null);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionFilter, setInteractionFilter] = useState('all');

  const fetchData = useCallback(async () => {
    if (!customerId) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/auth'); return; }

    const [custRes, contRes, intRes] = await Promise.all([
      supabase.from('customers').select('*').eq('id', customerId).single(),
      supabase.from('customer_contacts').select('*').eq('customer_id', customerId).eq('is_active', true),
      supabase.from('customer_interactions').select('*').eq('customer_id', customerId).order('interaction_date', { ascending: false }),
    ]);

    if (custRes.error || !custRes.data) {
      toast({ title: 'Customer not found', variant: 'destructive' });
      navigate('/customers');
      return;
    }

    setCustomer(custRes.data);
    const contactsData = (contRes.data || []) as ContactType[];
    setContacts(contactsData);
    setInteractions((intRes.data || []) as Interaction[]);

    // Build contact name lookup
    const cMap: Record<string, string> = {};
    contactsData.forEach(c => { cMap[c.id] = `${c.first_name} ${c.last_name}`; });
    setContactNames(cMap);

    // Fetch account manager
    if (custRes.data.account_manager_id) {
      const { data: emp } = await supabase.from('employees').select('name, surname').eq('id', custRes.data.account_manager_id).single();
      if (emp) setManagerName(`${emp.name} ${emp.surname}`);
    } else {
      setManagerName(null);
    }

    // Fetch creator names for interactions
    const creatorIds = [...new Set((intRes.data || []).map((i: Interaction) => i.created_by).filter(Boolean))] as string[];
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', creatorIds);
      const pMap: Record<string, string> = {};
      (profiles || []).forEach(p => { pMap[p.id] = p.email || 'Unknown'; });
      setCreatorNames(pMap);
    }

    setLoading(false);
  }, [customerId, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Delete this contact?')) return;
    const { error } = await supabase.from('customer_contacts').update({ is_active: false }).eq('id', contactId);
    if (error) { toast({ title: 'Error deleting contact', variant: 'destructive' }); return; }
    toast({ title: 'Contact removed' });
    fetchData();
  };

  const handleMarkComplete = async (interactionId: string) => {
    const { error } = await supabase.from('customer_interactions').update({ is_completed: true }).eq('id', interactionId);
    if (error) { toast({ title: 'Error updating', variant: 'destructive' }); return; }
    fetchData();
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-lg">Loading...</div></div>;
  }

  if (!customer) return null;

  const pendingFollowUps = interactions.filter(i => i.follow_up_date && !i.is_completed);
  const filteredInteractions = interactionFilter === 'all' ? interactions : interactions.filter(i => i.interaction_type === interactionFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" dir="ltr">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}><ArrowLeft className="h-5 w-5" /></Button>
            <Avatar className="h-14 w-14">
              <AvatarImage src={customer.logo_url || undefined} />
              <AvatarFallback className="text-lg" style={customer.brand_color ? { backgroundColor: customer.brand_color, color: '#fff' } : undefined}>
                {customer.company_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-display font-bold">{customer.company_name}</h1>
                {getStatusBadge(customer.customer_status)}
              </div>
              {customer.company_name_fa && <p className="text-muted-foreground" dir="rtl">{customer.company_name_fa}</p>}
            </div>
            <Button variant="outline" onClick={() => setShowEditCustomer(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{contacts.length}</p><p className="text-sm text-muted-foreground">Contacts</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{interactions.length}</p><p className="text-sm text-muted-foreground">Interactions</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{formatCurrency(customer.monthly_value, customer.currency)}</p><p className="text-sm text-muted-foreground">Monthly Value</p></CardContent></Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
              <TabsTrigger value="interactions">Activity ({interactions.length})</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Company Info */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">Company Information</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {customer.industry && <div className="flex justify-between"><span className="text-muted-foreground">Industry</span><span>{customer.industry}</span></div>}
                    {customer.company_size && <div className="flex justify-between"><span className="text-muted-foreground">Company Size</span><span>{customer.company_size}</span></div>}
                    {customer.website && <div className="flex justify-between"><span className="text-muted-foreground">Website</span><a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1">{customer.website}<ExternalLink className="h-3 w-3" /></a></div>}
                    {customer.email && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{customer.email}</span></div>}
                    {customer.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{customer.phone}</span></div>}
                    {(customer.address || customer.city || customer.country) && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{[customer.address, customer.city, customer.country].filter(Boolean).join(', ')}</span></div>
                    )}
                    {customer.linkedin_url && <div className="flex justify-between"><span className="text-muted-foreground">LinkedIn</span><a href={customer.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1">View<ExternalLink className="h-3 w-3" /></a></div>}
                    {customer.instagram_url && <div className="flex justify-between"><span className="text-muted-foreground">Instagram</span><a href={customer.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1">View<ExternalLink className="h-3 w-3" /></a></div>}
                  </CardContent>
                </Card>

                {/* Contract Info */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">Contract & Business</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Contract Type</span><span>{formatContractType(customer.contract_type)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Start Date</span><span>{customer.contract_start_date ? format(new Date(customer.contract_start_date), 'MMM d, yyyy') : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">End Date</span><span>{customer.contract_end_date ? format(new Date(customer.contract_end_date), 'MMM d, yyyy') : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Monthly Value</span><span className="font-semibold">{formatCurrency(customer.monthly_value, customer.currency)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Account Manager</span><span>{managerName || 'Not assigned'}</span></div>
                  </CardContent>
                </Card>

                {/* Tags & Notes */}
                {(customer.tags?.length || customer.notes) && (
                  <Card className="md:col-span-2">
                    <CardContent className="p-4 sm:p-6 space-y-3">
                      {customer.tags && customer.tags.length > 0 && (
                        <div><p className="text-sm text-muted-foreground mb-2">Tags</p><div className="flex flex-wrap gap-2">{customer.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</div></div>
                      )}
                      {customer.notes && <div><p className="text-sm text-muted-foreground mb-1">Notes</p><p className="text-sm whitespace-pre-wrap">{customer.notes}</p></div>}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Contacts</h2>
                <Button onClick={() => { setEditingContact(null); setShowContactForm(true); }}><Plus className="h-4 w-4 mr-2" />Add Contact</Button>
              </div>
              {contacts.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground"><Users className="h-10 w-10 mx-auto mb-3 opacity-50" /><p>No contacts yet</p><Button variant="outline" className="mt-3" onClick={() => { setEditingContact(null); setShowContactForm(true); }}>Add First Contact</Button></CardContent></Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map(c => (
                    <Card key={c.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={c.photo_url || undefined} />
                            <AvatarFallback>{c.first_name[0]}{c.last_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{c.first_name} {c.last_name}</p>
                            {(c.first_name_fa || c.last_name_fa) && <p className="text-xs text-muted-foreground" dir="rtl">{c.first_name_fa} {c.last_name_fa}</p>}
                            {c.job_title && <p className="text-sm text-muted-foreground">{c.job_title}{c.department ? ` · ${c.department}` : ''}</p>}
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 text-sm">
                          {c.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" /><span className="truncate">{c.email}</span></div>}
                          {c.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" /><span>{c.phone}</span></div>}
                          {c.mobile && <div className="flex items-center gap-2 text-muted-foreground"><PhoneCall className="h-3 w-3" /><span>{c.mobile}</span></div>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {c.is_primary_contact && <Badge className="bg-green-100 text-green-800 text-xs">Primary</Badge>}
                          {c.is_decision_maker && <Badge className="bg-purple-100 text-purple-800 text-xs">Decision Maker</Badge>}
                          <Badge variant="outline" className="text-xs">{c.contact_type || 'business'}</Badge>
                        </div>
                        <div className="flex justify-end gap-1 mt-3">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingContact(c); setShowContactForm(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Interactions Tab */}
            <TabsContent value="interactions">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold">Activity</h2>
                <div className="flex gap-2">
                  <select className="border rounded-md px-2 py-1 text-sm bg-background" value={interactionFilter} onChange={e => setInteractionFilter(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="proposal">Proposal</option>
                    <option value="contract_signed">Contract Signed</option>
                    <option value="invoice">Invoice</option>
                    <option value="note">Note</option>
                    <option value="other">Other</option>
                  </select>
                  <Button onClick={() => setShowInteractionForm(true)}><Plus className="h-4 w-4 mr-2" />Log Interaction</Button>
                </div>
              </div>

              {/* Pending Follow-ups */}
              {pendingFollowUps.length > 0 && (
                <Card className="mb-4 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><span className="font-semibold text-sm">Upcoming Follow-ups</span></div>
                    <div className="space-y-2">
                      {pendingFollowUps.map(i => (
                        <div key={i.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {interactionIcon(i.interaction_type)}
                            <span className="font-medium">{i.subject}</span>
                            <span className="text-muted-foreground">— {i.follow_up_date ? format(new Date(i.follow_up_date), 'MMM d, yyyy') : ''}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleMarkComplete(i.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {filteredInteractions.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground"><MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" /><p>No interactions yet</p><Button variant="outline" className="mt-3" onClick={() => setShowInteractionForm(true)}>Log First Interaction</Button></CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {filteredInteractions.map(i => (
                    <Card key={i.id}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-full bg-muted">{interactionIcon(i.interaction_type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{i.subject}</span>
                            <Badge variant="outline" className="text-xs">{i.interaction_type.replace(/_/g, ' ')}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(i.interaction_date), 'MMM d, yyyy · h:mm a')}
                            {i.contact_id && contactNames[i.contact_id] && <> · with {contactNames[i.contact_id]}</>}
                            {i.created_by && creatorNames[i.created_by] && <> · by {creatorNames[i.created_by]}</>}
                          </p>
                          {i.description && <p className="text-sm mt-1 line-clamp-2">{i.description}</p>}
                          {i.follow_up_date && !i.is_completed && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-amber-700">
                              <Clock className="h-3 w-3" />Follow-up: {format(new Date(i.follow_up_date), 'MMM d, yyyy')}
                              <Button variant="ghost" size="sm" className="h-5 px-1" onClick={() => handleMarkComplete(i.id)}><CheckCircle className="h-3 w-3 text-green-600" /></Button>
                            </div>
                          )}
                          {i.is_completed && i.follow_up_date && <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Completed</div>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Edit Customer Dialog */}
      <Dialog open={showEditCustomer} onOpenChange={setShowEditCustomer}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          <CustomerForm customer={customer} onSuccess={() => { setShowEditCustomer(false); fetchData(); }} onCancel={() => setShowEditCustomer(false)} />
        </DialogContent>
      </Dialog>

      {/* Contact Form Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle></DialogHeader>
          <CustomerContactForm customerId={customerId!} contact={editingContact} onSuccess={() => { setShowContactForm(false); fetchData(); }} onCancel={() => setShowContactForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Interaction Form Dialog */}
      <Dialog open={showInteractionForm} onOpenChange={setShowInteractionForm}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Log Interaction</DialogTitle></DialogHeader>
          <CustomerInteractionForm customerId={customerId!} contacts={contacts} onSuccess={() => { setShowInteractionForm(false); fetchData(); }} onCancel={() => setShowInteractionForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDetailPage;
