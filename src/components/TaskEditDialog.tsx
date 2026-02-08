import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, FileText, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { sendNotification } from '@/lib/notifications';

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  userRole: string;
  onTaskUpdated: () => void;
}

interface FileItem {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export function TaskEditDialog({ open, onOpenChange, task, userRole, onTaskUpdated }: TaskEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<FileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date) : undefined
  );
  const [startTime, setStartTime] = useState<Date | undefined>(
    task?.start_time ? new Date(task.start_time) : undefined
  );
  
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      task_name: task?.task_name || '',
      project_id: task?.project_id || '',
      priority: task?.priority || 'medium',
      status: task?.status || 'todo',
      assigned_to: task?.assigned_to || '',
      assigned_by: task?.assigned_by || '',
      task_type: task?.task_type || 'general',
      notes: task?.notes || '',
      outcome: task?.outcome || '',
      related_task_id: task?.related_task_id || '',
    },
  });

  const isAdmin = userRole === 'admin';
  const canEditAllFields = isAdmin;
  const canEditOutcomeOnly = !isAdmin;

  useEffect(() => {
    if (open && task) {
      form.reset({
        task_name: task.task_name || '',
        project_id: task.project_id || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        assigned_to: task.assigned_to || '',
        assigned_by: task.assigned_by || '',
        task_type: task.task_type || 'general',
        notes: task.notes || '',
        outcome: task.outcome || '',
        related_task_id: task.related_task_id || '',
      });
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setStartTime(task.start_time ? new Date(task.start_time) : undefined);
      setSelectedFiles([]);
      fetchExistingFiles();
    }
  }, [open, task, form]);

  const fetchExistingFiles = async () => {
    if (!task?.id) return;
    
    setFilesLoading(true);
    try {
      const { data: taskFiles, error: taskFilesError } = await supabase
        .from('task_files')
        .select(`
          file_id,
          files (
            id,
            file_name,
            file_url,
            file_size,
            file_type,
            created_at
          )
        `)
        .eq('task_id', task.id);

      if (taskFilesError) throw taskFilesError;

      const files = (taskFiles?.map(tf => tf.files).filter(Boolean).flat() || []).map((f: any) => ({
        id: f.id,
        file_name: f.file_name,
        file_url: f.file_url,
        created_at: f.created_at,
      }));
      setExistingFiles(files);
    } catch (error) {
      console.error('Error fetching existing files:', error);
      toast({
        title: "Error loading files",
        description: "Failed to load existing task files.",
        variant: "destructive"
      });
    } finally {
      setFilesLoading(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 50MB. Please choose a smaller file.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/*': ['.txt', '.csv']
    }
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('task_files')
        .delete()
        .eq('task_id', task.id)
        .eq('file_id', fileId);

      if (error) throw error;

      setExistingFiles(prev => prev.filter(file => file.id !== fileId));
      toast({
        title: "File removed",
        description: "File has been removed from the task."
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: "Error removing file",
        description: "Failed to remove the file from the task.",
        variant: "destructive"
      });
    }
  };

  const uploadFiles = async (taskId: string): Promise<void> => {
    if (selectedFiles.length === 0) return;

    const uploadPromises = selectedFiles.map(async (file) => {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `task-files/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('Files')
        .getPublicUrl(uploadData.path);

      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          project_id: task.project_id,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          description: 'Task outcome file'
        })
        .select('id')
        .single();

      if (fileError) throw fileError;

      const { error: taskFileError } = await supabase
        .from('task_files')
        .insert({
          task_id: taskId,
          file_id: fileRecord.id
        });

      if (taskFileError) throw taskFileError;
    });

    await Promise.all(uploadPromises);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const updateData: any = {};
      const previousAssignedTo = task.assigned_to;

      if (canEditAllFields) {
        // Admins can edit all fields
        updateData.task_name = values.task_name;
        updateData.priority = values.priority;
        updateData.status = values.status;
        updateData.assigned_to = values.assigned_to;
        updateData.assigned_by = values.assigned_by;
        updateData.task_type = values.task_type;
        updateData.notes = values.notes;
        updateData.outcome = values.outcome;
        updateData.related_task_id = values.related_task_id || null;
        updateData.due_date = dueDate ? dueDate.toISOString().split('T')[0] : null;
        updateData.start_time = startTime ? startTime.toISOString() : null;
      } else if (canEditOutcomeOnly) {
        // Regular users can only edit outcome and notes
        updateData.outcome = values.outcome;
        updateData.notes = values.notes;
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id);

      if (updateError) throw updateError;

      // Upload new files if any
      await uploadFiles(task.id);

      // Send notification if assignment changed to a different user
      if (canEditAllFields && values.assigned_to && values.assigned_to !== previousAssignedTo) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && values.assigned_to !== user.id) {
          await sendNotification(
            '📋 Task Reassigned',
            `You have been assigned: "${values.task_name || task.task_name}"`,
            [values.assigned_to],
            'task',
            `/projects/${task.project_id}`
          );
        }
      }

      toast({
        title: "Task updated successfully",
        description: canEditAllFields 
          ? "The task has been updated with all changes."
          : "Task outcome and notes have been updated."
      });

      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "Failed to update the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedFiles([]);
    setDueDate(undefined);
    setStartTime(undefined);
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {canEditAllFields ? 'Edit Task' : 'Update Task Outcome'}
          </DialogTitle>
          <DialogDescription>
            {canEditAllFields
              ? 'Update all task information and details.'
              : 'Add outcome details and notes for this task.'}
        </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Task Name - Admin only */}
              {canEditAllFields && (
                <FormField
                  control={form.control}
                  name="task_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Priority - Admin only */}
              {canEditAllFields && (
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
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Status - Admin only */}
              {canEditAllFields && (
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
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Due Date - Admin only */}
              {canEditAllFields && (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          {dueDate ? (
                            format(dueDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            </div>

            {/* Notes - Available to all users */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes or additional information..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Outcome - Available to all users */}
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Outcome</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the outcome of this task..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Section */}
            <div>
              <FormLabel>Outcome Files</FormLabel>
              
              {/* Existing Files */}
              {existingFiles.length > 0 && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Existing Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {existingFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.file_name}</span>
                            {file.file_size && (
                              <Badge variant="outline" className="text-xs">
                                {(file.file_size / 1024 / 1024).toFixed(2)} MB
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.file_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExistingFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* File Upload Area */}
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-muted-foreground/50",
                  isDragActive && "border-primary bg-primary/5"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {isDragActive ? (
                  <p className="text-sm text-muted-foreground">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag & drop files here, or click to select files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported: Images, PDF, Word, Excel, Text files (Max: 50MB each)
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
