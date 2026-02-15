import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Search, CreditCard, Activity, Clock, Users, Filter, X } from 'lucide-react';
import SubscriptionCard from '@/components/SubscriptionCard';
import SubscriptionForm from '@/components/SubscriptionForm';
import SubscriptionDetailDialog from '@/components/SubscriptionDetailDialog';
import { differenceInDays } from 'date-fns';

const SubscriptionsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [accountOwners, setAccountOwners] = useState<Record<string, string>>({});

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSub, setDetailSub] = useState<any>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);

      const { data } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).single();
      setIsAdmin(data?.role === 'admin');
      setLoading(false);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (user) fetchSubscriptions();
  }, [user]);

  const fetchSubscriptions = async () => {
    setSubsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('app_name');
      if (error) throw error;
      setSubscriptions(data || []);

      // Fetch account owner names
      const ownerIds = [...new Set((data || []).map(s => s.account_owner_id).filter(Boolean))];
      if (ownerIds.length > 0) {
        const { data: emps } = await supabase.from('employees').select('id, name, surname').in('id', ownerIds);
        if (emps) {
          const map: Record<string, string> = {};
          emps.forEach(e => { map[e.id] = `${e.name} ${e.surname}`; });
          setAccountOwners(map);
        }
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({ title: 'Error', description: 'Failed to load subscriptions', variant: 'destructive' });
    } finally {
      setSubsLoading(false);
    }
  };

  const getMonthly = (s: any) => {
    if (!s.cost_per_cycle) return 0;
    switch (s.billing_cycle) {
      case 'monthly': return s.cost_per_cycle;
      case 'yearly': return s.cost_per_cycle / 12;
      case 'weekly': return s.cost_per_cycle * 4.33;
      default: return 0;
    }
  };

  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    const totalMonthly = active.reduce((sum, s) => sum + getMonthly(s), 0);
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const upcoming = subscriptions.filter(s => {
      if (!s.next_payment_date) return false;
      const days = differenceInDays(new Date(s.next_payment_date), new Date());
      return days >= 0 && days <= 7;
    }).length;
    const totalSeats = subscriptions.reduce((sum, s) => sum + (s.max_seats || 0), 0);
    const usedSeats = subscriptions.reduce((sum, s) => sum + (s.used_seats || 0), 0);
    return { totalMonthly, activeCount, upcoming, totalSeats, usedSeats };
  }, [subscriptions]);

  const filtered = useMemo(() => {
    return subscriptions.filter(s => {
      const matchSearch = !search || s.app_name.toLowerCase().includes(search.toLowerCase()) || (s.app_name_fa || '').includes(search);
      const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchCycle = cycleFilter === 'all' || s.billing_cycle === cycleFilter;
      return matchSearch && matchCategory && matchStatus && matchCycle;
    });
  }, [subscriptions, search, categoryFilter, statusFilter, cycleFilter]);

  const hasFilters = search || categoryFilter !== 'all' || statusFilter !== 'all' || cycleFilter !== 'all';

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-lg">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 pt-20 pb-8" dir="ltr">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-8 w-8 text-violet-500" />
                <h1 className="text-3xl font-display font-bold">Subscriptions</h1>
              </div>
              <p className="text-muted-foreground">Company app and service subscriptions</p>
            </div>
            {isAdmin && (
              <Button onClick={() => { setEditingSub(null); setFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Subscription
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-7 w-7 text-green-500 flex-shrink-0" />
                <div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground truncate">Monthly Cost</p><p className="text-lg sm:text-2xl font-bold">${stats.totalMonthly.toFixed(0)}</p></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Activity className="h-7 w-7 text-blue-500 flex-shrink-0" />
                <div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground truncate">Active</p><p className="text-lg sm:text-2xl font-bold">{stats.activeCount}</p></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-7 w-7 text-orange-500 flex-shrink-0" />
                <div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground truncate">Due 7 Days</p><p className="text-lg sm:text-2xl font-bold">{stats.upcoming}</p></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Users className="h-7 w-7 text-purple-500 flex-shrink-0" />
                <div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground truncate">Seats</p><p className="text-lg sm:text-2xl font-bold">{stats.usedSeats}/{stats.totalSeats || '—'}</p></div>
              </div>
            </CardContent></Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ai_tools">AI Tools</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="project_management">Project Mgmt</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="cloud_hosting">Cloud & Hosting</SelectItem>
                  <SelectItem value="video_production">Video</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="3d_modeling">3D Modeling</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="free_tier">Free</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cycleFilter} onValueChange={setCycleFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                  <SelectItem value="pay_as_you_go">Pay As You Go</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="outline" size="icon" onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); setCycleFilter('all'); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {subsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
              {subscriptions.length === 0 ? (
                <>
                  <p className="mb-4">No subscriptions yet.</p>
                  {isAdmin && <Button onClick={() => { setEditingSub(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Add Subscription</Button>}
                </>
              ) : (
                <p>No subscriptions match your filters.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(sub => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  isAdmin={isAdmin}
                  onViewDetails={() => { setDetailSub(sub); setDetailOpen(true); }}
                  onEdit={() => { setEditingSub(sub); setFormOpen(true); }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Dialogs */}
      <SubscriptionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        subscription={editingSub}
        onSaved={fetchSubscriptions}
      />
      <SubscriptionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        subscription={detailSub}
        accountOwnerName={detailSub?.account_owner_id ? accountOwners[detailSub.account_owner_id] : undefined}
      />
    </div>
  );
};

export default SubscriptionsPage;
