import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { sendNotification, getOtherOurLifeUser, getOurLifeUserName } from "@/lib/notifications";

interface NewTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPerson: 'Raiana' | 'Mohammad' | 'Both';
  onTodoCreated: () => void;
}

const NewTodoDialog: React.FC<NewTodoDialogProps> = ({
  isOpen,
  onClose,
  selectedPerson,
  onTodoCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('our_todos')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          user_id: user.id,
        });

      if (error) throw error;

      // Send notification to the other Our Life user
      const otherUserId = getOtherOurLifeUser(user.id);
      if (otherUserId) {
        const actorName = getOurLifeUserName(user.id);
        await sendNotification(
          '✅ New Task Added',
          `${actorName} added: "${formData.title}" (${formData.priority} priority)`,
          [otherUserId],
          'task',
          '/our-todo'
        );
      }

      toast({
        title: "Success",
        description: "Todo created successfully!",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
      });

      onTodoCreated();
      onClose();
    } catch (error) {
      console.error('Error creating todo:', error);
      toast({
        title: "Error",
        description: "Failed to create todo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        person_name: selectedPerson
      }));
    }
  }, [isOpen, selectedPerson]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass-card border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Add New Task</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new task for {selectedPerson}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task_title" className="text-foreground text-sm font-medium">
              Task Title *
            </Label>
            <Input
              id="task_title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title..."
              className="glass-input border-border bg-background text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter task description (optional)..."
              className="glass-input border-border bg-background text-foreground placeholder:text-muted-foreground min-h-[80px]"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-foreground text-sm font-medium">
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger className="glass-input border-border bg-background text-foreground">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="glass-card border-border bg-card">
                <SelectItem value="low" className="text-foreground hover:bg-accent">Low</SelectItem>
                <SelectItem value="medium" className="text-foreground hover:bg-accent">Medium</SelectItem>
                <SelectItem value="high" className="text-foreground hover:bg-accent">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTodoDialog;