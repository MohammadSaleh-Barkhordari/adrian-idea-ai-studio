import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  project_name: z.string().min(1, 'Project name is required'),
  customer_id: z.string().optional(),
  client_contact_id: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  priority: z.enum(['high', 'medium', 'low']),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  budget: z.number().positive().optional(),
});

type FormData = z.infer<typeof formSchema>;

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

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export const NewProjectDialog = ({ open, onOpenChange, onProjectCreated }: NewProjectDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_name: '',
      customer_id: undefined,
      client_contact_id: undefined,
      description: '',
      status: 'planning' as const,
      priority: 'medium' as const,
      budget: undefined,
    },
  });

  const selectedCustomerId = form.watch('customer_id');

  useEffect(() => {
    if (open) {
      supabase.from('customers').select('id, company_name, customer_status').order('company_name').then(({ data }) => {
        setCustomers(data || []);
      });
    }
  }, [open]);

  useEffect(() => {
    if (selectedCustomerId) {
      supabase.from('customer_contacts').select('id, first_name, last_name, job_title, is_primary_contact').eq('customer_id', selectedCustomerId).eq('is_active', true).order('is_primary_contact', { ascending: false }).then(({ data }) => {
        setContacts(data || []);
        const primary = data?.find(c => c.is_primary_contact);
        if (primary) {
          form.setValue('client_contact_id', primary.id);
        } else {
          form.setValue('client_contact_id', undefined);
        }
      });
    } else {
      setContacts([]);
      form.setValue('client_contact_id', undefined);
    }
  }, [selectedCustomerId]);

  const generateProjectId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PROJ-${year}${month}${day}-${random}`;
  };

  const onSubmit = async (values: FormData) => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Authentication required', description: 'Please sign in to create a project.', variant: 'destructive' });
        return;
      }

      const projectId = generateProjectId();

      // Build backward-compat text fields
      const selectedCustomer = customers.find(c => c.id === values.customer_id);
      const selectedContact = contacts.find(c => c.id === values.client_contact_id);

      const { error } = await supabase
        .from('adrian_projects')
        .insert({
          project_id: projectId,
          project_name: values.project_name,
          customer_id: values.customer_id || null,
          client_contact_id: values.client_contact_id || null,
          client_name: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name}` : null,
          client_company: selectedCustomer?.company_name || null,
          description: values.description || null,
          status: values.status,
          priority: values.priority,
          start_date: values.start_date ? format(values.start_date, 'yyyy-MM-dd') : null,
          end_date: values.end_date ? format(values.end_date, 'yyyy-MM-dd') : null,
          budget: values.budget || null,
          user_id: session.user.id,
          created_by: session.user.id,
        } as any);

      if (error) {
        console.error('Error creating project:', error);
        toast({ title: 'Error creating project', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Project created successfully', description: `Project ${projectId} has been created.` });
      form.reset();
      onOpenChange(false);
      onProjectCreated();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({ title: 'Error creating project', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600';
      case 'lead': return 'bg-blue-500/10 text-blue-600';
      case 'prospect': return 'bg-purple-500/10 text-purple-600';
      case 'inactive': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the project details below. Required fields are marked with an asterisk.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Contact</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedCustomerId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedCustomerId ? "Select contact" : "Select a customer first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.first_name} {c.last_name}{c.job_title ? ` — ${c.job_title}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter budget amount"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className={cn('p-3 pointer-events-auto')} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className={cn('p-3 pointer-events-auto')} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter project description..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-accent">
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
