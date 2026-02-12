import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Upload, FileText, X, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendNotification, getUserIdByEmail } from '@/lib/notifications';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onTaskCreated: () => void;
}

interface Task {
  id: string;
  title: string;
}

interface AuthUser {
  id: string;
  email: string;
}

interface Letter {
  id: string;
  subject: string | null;
}

interface Document {
  id: string;
  title: string;
  file_name: string;
}

interface FileItem {
  id: string;
  file_name: string;
  description: string;
}

export const NewTaskDialog: React.FC<NewTaskDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onTaskCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [projectName, setProjectName] = useState<string>('');
  
  // New state for related items
  const [relatedLetters, setRelatedLetters] = useState<Letter[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [relatedFileItems, setRelatedFileItems] = useState<FileItem[]>([]);
  const [selectedFileItems, setSelectedFileItems] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    taskName: '',
    assignedBy: '',
    assignedTo: '',
    followBy: '',
    priority: 'medium',
    outcome: '',
    notes: '',
    status: 'todo',
    relatedTaskId: ''
  });
  const { toast } = useToast();

  // Fetch current user and related tasks on dialog open
  useEffect(() => {
    if (open) {
      fetchCurrentUser();
      fetchRelatedTasks();
      fetchAuthUsers();
      fetchProjectName();
      fetchRelatedLetters();
      fetchRelatedDocuments();
      fetchRelatedFileItems();
    }
  }, [open, projectId]);

  const fetchProjectName = async () => {
    try {
      const { data, error } = await supabase
        .from('adrian_projects')
        .select('project_name')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;
      setProjectName(data.project_name || projectId);
    } catch (error) {
      console.error('Error fetching project name:', error);
      setProjectName(projectId); // Fallback to project ID
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const currentUserData = { id: user.id, email: user.email };
        setCurrentUser(currentUserData);
        setFormData(prev => ({
          ...prev,
          assignedBy: user.email
        }));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchRelatedTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatedTasks((data || []).map(t => ({ id: t.id, title: t.title })));
    } catch (error) {
      console.error('Error fetching related tasks:', error);
    }
  };

  const fetchAuthUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-auth-users');
      if (error) throw error;
      setAuthUsers(data?.users || []);
    } catch (error) {
      console.error('Error fetching auth users:', error);
    }
  };

  const fetchRelatedLetters = async () => {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('id, subject')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatedLetters((data || []).map(l => ({ id: l.id, subject: l.subject })));
    } catch (error) {
      console.error('Error fetching related letters:', error);
    }
  };

  const fetchRelatedDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, file_name')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatedDocuments(data || []);
    } catch (error) {
      console.error('Error fetching related documents:', error);
    }
  };

  const fetchRelatedFileItems = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('id, file_name, description')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatedFileItems(data || []);
    } catch (error) {
      console.error('Error fetching related files:', error);
    }
  };

  const uploadFiles = async (files: File[], taskId: string): Promise<void> => {
    try {
      setUploading(true);
      
      for (const file of files) {
        const filePath = `${projectName}/${taskId}/${file.name}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('Files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('Files')
          .getPublicUrl(filePath);

        // Insert file record into files table
        const { data: fileData, error: insertError } = await supabase
          .from('files')
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_url: filePath,
            file_size: file.size,
            file_type: file.type,
            description: 'Outcome',
            project_id: projectId,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Create task-file relationship in junction table
        const { error: relationError } = await supabase
          .from('task_files')
          .insert({
            task_id: taskId,
            file_id: fileData.id,
          });

        if (relationError) throw relationError;
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload some files",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create tasks",
          variant: "destructive",
        });
        return;
      }

      // Create task first
      const taskData = {
        title: formData.taskName.trim(),
        task_name: formData.taskName.trim(),
        description: formData.notes.trim() || null,
        assigned_to: formData.assignedTo === 'unassigned' ? null : formData.assignedTo || null,
        assigned_by: formData.assignedBy || null,
        created_by: user.id,
        user_id: user.id,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        start_time: startDate ? startDate.toISOString() : null,
        priority: formData.priority,
        status: formData.status,
        project_id: projectId,
        outcome: formData.outcome || null,
        follow_by: formData.followBy === 'unassigned' ? null : formData.followBy || null,
        related_task_id: formData.relatedTaskId === 'none' ? null : formData.relatedTaskId || null,
      };

      const { data: taskResult, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating task:', error);
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
        return;
      }

      // Upload files if present
      if (selectedFiles.length > 0) {
        await uploadFiles(selectedFiles, taskResult.id);
      }

      // Create task-letter relationships
      if (selectedLetters.length > 0) {
        const letterRelationships = selectedLetters.map(letterId => ({
          task_id: taskResult.id,
          letter_id: letterId
        }));
        
        const { error: letterError } = await supabase
          .from('task_letters')
          .insert(letterRelationships);
          
        if (letterError) throw letterError;
      }

      // Create task-document relationships
      if (selectedDocuments.length > 0) {
        const documentRelationships = selectedDocuments.map(documentId => ({
          task_id: taskResult.id,
          document_id: documentId
        }));
        
        const { error: documentError } = await supabase
          .from('task_documents')
          .insert(documentRelationships);
          
        if (documentError) throw documentError;
      }

      // Create task-file relationships for selected existing files
      if (selectedFileItems.length > 0) {
        const fileRelationships = selectedFileItems.map(fileId => ({
          task_id: taskResult.id,
          file_id: fileId
        }));
        
        const { error: fileError } = await supabase
          .from('task_files')
          .insert(fileRelationships);
          
        if (fileError) throw fileError;
      }

      // Send notification to assigned user if different from creator
      if (formData.assignedTo && formData.assignedTo !== 'unassigned' && formData.assignedTo !== user.id) {
        // assignedTo is already a user ID (UUID)
        await sendNotification(
          '📋 New Task Assigned',
          `You have been assigned: "${formData.taskName}" in project ${projectName}`,
          [formData.assignedTo],
          'task',
          `/projects/${projectId}`
        );
      }

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form and close dialog
      handleClose();
      onTaskCreated();

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      taskName: '',
      assignedBy: '',
      assignedTo: '',
      followBy: '',
      priority: 'medium',
      outcome: '',
      notes: '',
      status: 'todo',
      relatedTaskId: ''
    });
    setSelectedFiles([]);
    setSelectedLetters([]);
    setSelectedDocuments([]);
    setSelectedFileItems([]);
    setStartDate(undefined);
    setDueDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task for this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] pr-6">
            <div className="grid gap-4 py-4">
            {/* Task Name */}
            <div className="grid gap-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                value={formData.taskName}
                onChange={(e) => handleInputChange('taskName', e.target.value)}
                placeholder="Enter task name"
                required
              />
            </div>

            {/* Related Task */}
            <div className="grid gap-2">
              <Label htmlFor="relatedTask">Related Task</Label>
              <Select value={formData.relatedTaskId} onValueChange={(value) => handleInputChange('relatedTaskId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a related task (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No related task</SelectItem>
                  {relatedTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Related Letters */}
            <div className="grid gap-2">
              <Label htmlFor="relatedLetters">Related Letters</Label>
              <Select value="" onValueChange={(value) => {
                if (value && !selectedLetters.includes(value)) {
                  setSelectedLetters(prev => [...prev, value]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select related letters (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {relatedLetters.filter(letter => !selectedLetters.includes(letter.id)).map((letter) => (
                    <SelectItem key={letter.id} value={letter.id}>
                      {letter.subject || `Letter ${letter.id.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLetters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedLetters.map((letterId) => {
                    const letter = relatedLetters.find(l => l.id === letterId);
                    return (
                      <div key={letterId} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        <span>{letter?.subject || `Letter ${letterId.slice(0, 8)}`}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-primary/70" 
                          onClick={() => setSelectedLetters(prev => prev.filter(id => id !== letterId))}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Related Documents */}
            <div className="grid gap-2">
              <Label htmlFor="relatedDocuments">Related Documents</Label>
              <Select value="" onValueChange={(value) => {
                if (value && !selectedDocuments.includes(value)) {
                  setSelectedDocuments(prev => [...prev, value]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select related documents (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {relatedDocuments.filter(doc => !selectedDocuments.includes(doc.id)).map((document) => (
                    <SelectItem key={document.id} value={document.id}>
                      {document.title || document.file_name || `Document ${document.id.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDocuments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDocuments.map((documentId) => {
                    const document = relatedDocuments.find(d => d.id === documentId);
                    return (
                      <div key={documentId} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        <span>{document?.title || document?.file_name || `Document ${documentId.slice(0, 8)}`}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-primary/70" 
                          onClick={() => setSelectedDocuments(prev => prev.filter(id => id !== documentId))}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Related Files */}
            <div className="grid gap-2">
              <Label htmlFor="relatedFiles">Related Files</Label>
              <Select value="" onValueChange={(value) => {
                if (value && !selectedFileItems.includes(value)) {
                  setSelectedFileItems(prev => [...prev, value]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select related files (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {relatedFileItems.filter(file => !selectedFileItems.includes(file.id)).map((fileItem) => (
                    <SelectItem key={fileItem.id} value={fileItem.id}>
                      {fileItem.file_name} {fileItem.description && `(${fileItem.description})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFileItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFileItems.map((fileId) => {
                    const fileItem = relatedFileItems.find(f => f.id === fileId);
                    return (
                      <div key={fileId} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        <span>{fileItem?.file_name || `File ${fileId.slice(0, 8)}`}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-primary/70" 
                          onClick={() => setSelectedFileItems(prev => prev.filter(id => id !== fileId))}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assignment Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignedBy">Assigned By</Label>
                <Input
                  id="assignedBy"
                  value={formData.assignedBy}
                  onChange={(e) => handleInputChange('assignedBy', e.target.value)}
                  placeholder="Who assigned this task"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {authUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Follow By Field */}
            <div className="grid gap-2">
              <Label htmlFor="followBy">Follow Up By</Label>
              <Select value={formData.followBy} onValueChange={(value) => handleInputChange('followBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select who will follow up" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {authUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      className={cn("p-3 pointer-events-auto")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      className={cn("p-3 pointer-events-auto")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Outcome */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Paperclip 
                  className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" 
                  onClick={() => document.getElementById('outcome-file-upload')?.click()}
                />
              </div>
              <Input
                id="outcome"
                value={formData.outcome}
                onChange={(e) => handleInputChange('outcome', e.target.value)}
                placeholder="Expected or achieved outcome"
              />
            </div>

            {/* File Upload for Outcome - Updated to support multiple files */}
            <div className="grid gap-2">
              <Label>Outcome File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload a file related to this outcome
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedFiles(prev => [...prev, ...files]);
                      }}
                      className="hidden"
                      id="outcome-file-upload"
                      disabled={uploading}
                    />
                    <label 
                      htmlFor="outcome-file-upload" 
                      className={cn(
                        "inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 text-sm min-h-[44px] min-w-[44px]",
                        uploading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Select File'}
                    </label>
                  </div>
              </div>
              
              {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="p-3 bg-muted rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this task"
                rows={3}
               />
             </div>
           </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};