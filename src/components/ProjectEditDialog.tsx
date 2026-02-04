import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

const MILESTONE_THRESHOLDS = [25, 50, 75, 100];

export function ProjectEditDialog({ open, onOpenChange, project, onProjectUpdated }: ProjectEditDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    client_name: '',
    client_company: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    budget: '',
    progress: 0,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || '',
        client_name: project.client_name || '',
        client_company: project.client_company || '',
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

  const getNextMilestone = (currentProgress: number, newProgress: number): number | null => {
    for (const milestone of MILESTONE_THRESHOLDS) {
      if (currentProgress < milestone && newProgress >= milestone) {
        return milestone;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update a project",
          variant: "destructive",
        });
        return;
      }

      const oldStatus = project.status;
      const oldProgress = project.progress || 0;
      const newStatus = formData.status;
      const newProgress = formData.progress;

      // Update the project
      const { error } = await supabase
        .from('adrian_projects')
        .update({
          project_name: formData.project_name,
          client_name: formData.client_name || null,
          client_company: formData.client_company || null,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          progress: formData.progress,
          start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
          end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);

      if (error) throw error;

      // Get all admin users to notify about project changes
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const adminUserIds = adminRoles?.map(r => r.user_id).filter(id => id !== user.id) || [];

      // Send notification for status change
      if (oldStatus !== newStatus && adminUserIds.length > 0) {
        const statusLabel = newStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        await sendNotification(
          '📊 Project Status Updated',
          `"${formData.project_name}" status changed to ${statusLabel}`,
          adminUserIds,
          'project',
          `/projects/${project.project_id}`
        );
      }

      // Check for milestone completion
      const milestone = getNextMilestone(oldProgress, newProgress);
      if (milestone !== null && adminUserIds.length > 0) {
        await sendNotification(
          `🎯 Milestone Reached: ${milestone}%`,
          `"${formData.project_name}" has reached ${milestone}% completion!`,
          adminUserIds,
          'project',
          `/projects/${project.project_id}`
        );
      }

      // Special notification for project completion
      if (newStatus === 'completed' && oldStatus !== 'completed' && adminUserIds.length > 0) {
        await sendNotification(
          '🎉 Project Completed!',
          `"${formData.project_name}" has been marked as completed`,
          adminUserIds,
          'project',
          `/projects/${project.project_id}`
        );
      }

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      onProjectUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
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
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_company">Client Company</Label>
              <Input
                id="client_company"
                value={formData.client_company}
                onChange={(e) => setFormData(prev => ({ ...prev, client_company: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="Enter budget amount"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
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
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
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
              <Input
                id="progress"
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
