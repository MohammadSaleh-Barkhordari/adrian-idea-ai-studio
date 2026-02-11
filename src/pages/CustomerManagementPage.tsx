import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Building2, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown,
  Filter, X, Edit, Trash2, Eye, ArrowLeft, Users, DollarSign, UserPlus
} from 'lucide-react';
import CustomerForm from '@/components/CustomerForm';

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

const CustomerManagementPage = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('company_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Lookup maps
  const [primaryContacts, setPrimaryContacts] = useState<Record<string, string>>({});
  const [accountManagers, setAccountManagers] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = data?.role || 'general_user';
      setUserRole(role);

      if (role !== 'admin') {
        toast({ title: "Access Denied", description: "You need admin privileges.", variant: "destructive" });
        navigate('/dashboard');
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user && userRole === 'admin') fetchCustomers();
  }, [user, userRole]);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCustomers(data || []);

      // Fetch primary contacts
      const { data: contacts } = await supabase
        .from('customer_contacts')
        .select('customer_id, first_name, last_name')
        .eq('is_primary_contact', true);
      if (contacts) {
        const map: Record<string, string> = {};
        contacts.forEach(c => { map[c.customer_id] = `${c.first_name} ${c.last_name}`; });
        setPrimaryContacts(map);
      }

      // Fetch account managers
      const managerIds = [...new Set((data || []).map(c => c.account_manager_id).filter(Boolean))];
      if (managerIds.length > 0) {
        const { data: emps } = await supabase
          .from('employees')
          .select('id, name, surname')
          .in('id', managerIds);
        if (emps) {
          const map: Record<string, string> = {};
          emps.forEach(e => { map[e.id] = `${e.name} ${e.surname}`; });
          setAccountManagers(map);
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({ title: "Error", description: "Failed to fetch customers", variant: "destructive" });
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This will also delete all contacts and interactions.')) return;
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({ title: "Success", description: "Customer deleted successfully" });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({ title: "Error", description: "Failed to delete customer", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'lead': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Lead</Badge>;
      case 'prospect': return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">Prospect</Badge>;
      case 'active': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'inactive': return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Inactive</Badge>;
      case 'churned': return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Churned</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number | null, currency: string | null) => {
    if (value == null) return '-';
    const sym = { IRR: 'IRR', USD: '$', EUR: '€', GBP: '£' }[currency || 'IRR'] || currency || '';
    return `${sym} ${value.toLocaleString()}`;
  };

  const uniqueIndustries = [...new Set(customers.map(c => c.industry).filter(Boolean))] as string[];

  const filteredAndSorted = useMemo(() => {
    let filtered = customers.filter(c => {
      const matchesSearch = searchTerm === '' ||
        c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company_name_fa || '').includes(searchTerm) ||
        (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.customer_status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
      return matchesSearch && matchesStatus && matchesIndustry;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortColumn as keyof Customer];
      let bVal = b[sortColumn as keyof Customer];
      if (aVal == null) aVal = '' as any;
      if (bVal == null) bVal = '' as any;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if ((aVal as any) < (bVal as any)) return sortDirection === 'asc' ? -1 : 1;
      if ((aVal as any) > (bVal as any)) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, industryFilter, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setIndustryFilter('all');
  };

  const hasFilters = searchTerm || statusFilter !== 'all' || industryFilter !== 'all';
  const activeCount = customers.filter(c => c.customer_status === 'active').length;
  const leadCount = customers.filter(c => c.customer_status === 'lead').length;
  const totalMonthly = customers
    .filter(c => c.customer_status === 'active')
    .reduce((sum, c) => sum + (c.monthly_value || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (userRole !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 pt-20 pb-8" dir="ltr">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </div>

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-amber-500" />
                <h1 className="text-3xl font-display font-bold">Customer Management</h1>
              </div>
              <p className="text-muted-foreground">Manage B2B customers, contacts, and interactions</p>
            </div>
            <Button onClick={() => { setEditingCustomer(null); setShowCustomerForm(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Customer
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold">{customers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Customers</p>
                    <p className="text-2xl font-bold">{activeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Value</p>
                    <p className="text-2xl font-bold">{totalMonthly > 0 ? totalMonthly.toLocaleString() : '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-2xl font-bold">{leadCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Table */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Customer Directory
              </CardTitle>
              <CardDescription>View and manage your B2B customers</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Industries" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {uniqueIndustries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {hasFilters && (
                    <Button variant="outline" onClick={clearFilters} size="sm">
                      <X className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Table */}
              {customersLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
              ) : filteredAndSorted.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  {customers.length === 0 ? (
                    <>
                      <p className="mb-4">No customers yet. Start by adding your first customer.</p>
                      <Button onClick={() => { setEditingCustomer(null); setShowCustomerForm(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Customer
                      </Button>
                    </>
                  ) : (
                    <p>No customers match your filters. Try adjusting your search.</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Logo</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('company_name')}>
                          <div className="flex items-center gap-1">Company Name {getSortIcon('company_name')}</div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('industry')}>
                          <div className="flex items-center gap-1">Industry {getSortIcon('industry')}</div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('customer_status')}>
                          <div className="flex items-center gap-1">Status {getSortIcon('customer_status')}</div>
                        </TableHead>
                        <TableHead>Primary Contact</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('monthly_value')}>
                          <div className="flex items-center gap-1">Monthly Value {getSortIcon('monthly_value')}</div>
                        </TableHead>
                        <TableHead>Account Manager</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSorted.map(customer => (
                        <TableRow
                          key={customer.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          <TableCell>
                            <Avatar className="h-9 w-9">
                              {customer.logo_url ? (
                                <AvatarImage src={customer.logo_url} alt={customer.company_name} />
                              ) : null}
                              <AvatarFallback className="text-xs">
                                {customer.company_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customer.company_name}</div>
                              {customer.company_name_fa && (
                                <div className="text-xs text-muted-foreground" dir="rtl">{customer.company_name_fa}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{customer.industry || '-'}</TableCell>
                          <TableCell>{getStatusBadge(customer.customer_status)}</TableCell>
                          <TableCell>{primaryContacts[customer.id] || '-'}</TableCell>
                          <TableCell>{formatCurrency(customer.monthly_value, customer.currency)}</TableCell>
                          <TableCell>
                            {customer.account_manager_id ? accountManagers[customer.account_manager_id] || '-' : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${customer.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setEditingCustomer(customer); setShowCustomerForm(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Add/Edit Customer Dialog */}
      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={editingCustomer}
            onSuccess={() => { setShowCustomerForm(false); setEditingCustomer(null); fetchCustomers(); }}
            onCancel={() => { setShowCustomerForm(false); setEditingCustomer(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagementPage;
