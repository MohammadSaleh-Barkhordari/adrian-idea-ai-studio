import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/lib/notifications';

interface Project {
  id: string;
  project_id: string;
  project_name: string;
  client_name?: string;
  client_company?: string;
  customer_id?: string;
  client_contact_id?: string;
  description?: string;
  status: string;
  priority: string;
  budget?: number;
  progress?: number;
  start_date?: string;
  end_date?: string;
  assigned_to?: string;
}

interface ProjectEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onProjectUpdated: () => void;
}

interface Customer {
  id: string;
  company_name: string;
  customer_status: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  is_primary_contact: boolean | null;
}

const MILESTONE_THRESHOLDS = [25, 50, 75, 100];

export function ProjectEditDialog({ open, onOpenChange, project, onProjectUpdated }: ProjectEditDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({
    project_name: '',
    customer_id: '' as string,
    client_contact_id: '' as string,
    description: '',
    status: 'planning',
    priority: 'medium',
    budget: '',
    progress: 0,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
  });

  // Load customers when dialog opens
  useEffect(() => {
    if (open) {
      supabase.from('customers').select('id, company_name, customer_status').order('company_name').then(({ data }) => {
        setCustomers(data || []);
      });
    }
  }, [open]);

  // Load contacts when customer changes
  useEffect(() => {
    if (formData.customer_id) {
      supabase.from('customer_contacts').select('id, first_name, last_name, job_title, is_primary_contact').eq('customer_id', formData.customer_id).eq('is_active', true).order('is_primary_contact', { ascending: false }).then(({ data }) => {
        setContacts(data || []);
      });
    } else {
      setContacts([]);
    }
  }, [formData.customer_id]);

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || '',
        customer_id: (project as any).customer_id || '',
        client_contact_id: (project as any).client_contact_id || '',
        description: project.description || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        budget: project.budget?.toString() || '',
        progress: project.progress || 0,
        start_date: project.start_date ? new Date(project.start_date) : undefined,
        end_date: project.end_date ? new Date(project.end_date) : undefined,
      });
    }
  }, [project]);

  const handleCustomerChange = (value: string) => {
    setFormData(prev => ({ ...prev, customer_id: value, client_contact_id: '' }));
    // Auto-select primary contact after contacts load
    supabase.from('customer_contacts').select('id, first_name, last_name, job_title, is_primary_contact').eq('customer_id', value).eq('is_active', true).order('is_primary_contact', { ascending: false }).then(({ data }) => {
      setContacts(data || []);
      const primary = data?.find(c => c.is_primary_contact);
      if (primary) {
        setFormData(prev => ({ ...prev, client_contact_id: primary.id }));
      }
    });
  };

  const getNextMilestone = (currentProgress: number, newProgress: number): number | null => {
    for (const milestone of MILESTONE_THRESHOLDS) {
      if (currentProgress < milestone && newProgress >= milestone) return milestone;
    }
    return null;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600';
      case 'lead': return 'bg-blue-500/10 text-blue-600';
      case 'prospect': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to update a project", variant: "destructive" });
        return;
      }

      const oldStatus = project.status;
      const oldProgress = project.progress || 0;
      const newStatus = formData.status;
      const newProgress = formData.progress;

      // Build backward-compat text fields
      const selectedCustomer = customers.find(c => c.id === formData.customer_id);
      const selectedContact = contacts.find(c => c.id === formData.client_contact_id);

      const { error } = await supabase
        .from('adrian_projects')
        .update({
          project_name: formData.project_name,
          customer_id: formData.customer_id || null,
          client_contact_id: formData.client_contact_id || null,
          client_name: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name}` : null,
          client_company: selectedCustomer?.company_name || null,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          progress: formData.progress,
          start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
          end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', project.id);

      if (error) throw error;

      // Notifications logic
      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      const adminUserIds = adminRoles?.map(r => r.user_id).filter(id => id !== user.id) || [];

      if (oldStatus !== newStatus && adminUserIds.length > 0) {
        const statusLabel = newStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        await sendNotification('📊 Project Status Updated', `"${formData.project_name}" status changed to ${statusLabel}`, adminUserIds, 'project', `/projects/${project.project_id}`);
      }

      const milestone = getNextMilestone(oldProgress, newProgress);
      if (milestone !== null && adminUserIds.length > 0) {
        await sendNotification(`🎯 Milestone Reached: ${milestone}%`, `"${formData.project_name}" has reached ${milestone}% completion!`, adminUserIds, 'project', `/projects/${project.project_id}`);
      }

      if (newStatus === 'completed' && oldStatus !== 'completed' && adminUserIds.length > 0) {
        await sendNotification('🎉 Project Completed!', `"${formData.project_name}" has been marked as completed`, adminUserIds, 'project', `/projects/${project.project_id}`);
      }

      toast({ title: "Success", description: "Project updated successfully" });
      onProjectUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name *</Label>
              <Input id="project_name" value={formData.project_name} onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))} required />
            </div>
            
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={formData.customer_id} onValueChange={handleCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <span>{c.company_name}</span>
                        <Badge variant="outline" className={cn('text-xs', getStatusBadgeColor(c.customer_status))}>
                          {c.customer_status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Client Contact</Label>
              <Select value={formData.client_contact_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_contact_id: value }))} disabled={!formData.customer_id}>
                <SelectTrigger>
                  <SelectValue placeholder={formData.customer_id ? "Select contact" : "Select a customer first"} />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}{c.job_title ? ` — ${c.job_title}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" type="number" value={formData.budget} onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))} placeholder="Enter budget amount" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="progress">Progress ({formData.progress}%)</Label>
              <Input id="progress" type="range" min="0" max="100" value={formData.progress} onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.start_date} onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.end_date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.end_date} onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={4} />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Project'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
