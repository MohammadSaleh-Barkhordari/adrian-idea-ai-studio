import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, FileText, Download, Paperclip, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/lib/notifications';
import TaskVoiceRecorderBox from '@/components/TaskVoiceRecorderBox';
import { transcribeAudioBlob } from '@/lib/transcribeAudio';

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
  created_at: string;
}

interface AuthUser {
  id: string;
  email: string;
}

interface RelatedTask {
  id: string;
  task_name: string | null;
}


export function TaskEditDialog({ open, onOpenChange, task, userRole, onTaskUpdated }: TaskEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<FileItem[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<RelatedTask[]>([]);
  
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();

  // Voice recorder state
  const [descriptionAudioBlob, setDescriptionAudioBlob] = useState<Blob | null>(null);
  const [outcomeAudioBlob, setOutcomeAudioBlob] = useState<Blob | null>(null);
  const [outcomeAudioUrl, setOutcomeAudioUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    taskName: '',
    taskType: 'general',
    assignedBy: '',
    assignedTo: '',
    followBy: '',
    confirmBy: '',
    priority: 'medium',
    status: 'todo',
    description: '',
    notes: '',
    relatedTaskId: '',
    outcomeNotes: '',
    predecessorTaskId: '',
    successorTaskId: '',
  });

  // Non-admin editable fields
  const [userOutcomeNotes, setUserOutcomeNotes] = useState('');
  const [userStatus, setUserStatus] = useState('in_progress');

  const { toast } = useToast();
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (open && task) {
      setFormData({
        taskName: task.task_name || '',
        taskType: task.task_type || 'general',
        assignedBy: task.assigned_by || 'unassigned',
        assignedTo: task.assigned_to || 'unassigned',
        followBy: task.follow_by || 'unassigned',
        confirmBy: task.confirm_by || 'unassigned',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        description: task.description || '',
        notes: task.notes || '',
        relatedTaskId: task.related_task_id || 'none',
        outcomeNotes: task.outcome_notes || '',
        predecessorTaskId: task.predecessor_task_id || 'none',
        successorTaskId: task.successor_task_id || 'none',
      });
      setStartDate(task.start_time ? new Date(task.start_time) : undefined);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setSelectedFiles([]);
      setOutcomeAudioUrl(task.outcome_audio_path || null);
      setDescriptionAudioBlob(null);
      setOutcomeAudioBlob(null);

      // Non-admin defaults
      setUserOutcomeNotes(task.outcome_notes || '');
      setUserStatus(task.status === 'completed' ? 'completed' : task.status === 'in_progress' ? 'in_progress' : 'in_progress');

      fetchAuthUsers();
      fetchExistingFiles();
      fetchProjectName();
      
      if (task.project_id) fetchRelatedTasks(task.project_id);
    }
  }, [open, task]);

  const fetchProjectName = async () => {
    if (!task?.project_id) { setProjectName(''); return; }
    try {
      const { data, error } = await supabase
        .from('adrian_projects')
        .select('project_name')
        .eq('project_id', task.project_id)
        .single();
      if (error) throw error;
      setProjectName(data?.project_name || task.project_id);
    } catch {
      setProjectName(task.project_id);
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

  const fetchRelatedTasks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, task_name')
        .eq('project_id', projectId)
        .neq('id', task.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRelatedTasks(data || []);
    } catch (error) {
      console.error('Error fetching related tasks:', error);
    }
  };


  const fetchExistingFiles = async () => {
    if (!task?.id) return;
    try {
      const { data: taskFiles, error } = await supabase
        .from('task_files')
        .select(`file_id, files (id, file_name, file_url, file_size, created_at)`)
        .eq('task_id', task.id);
      if (error) throw error;
      const files = (taskFiles?.map(tf => tf.files).filter(Boolean).flat() || []).map((f: any) => ({
        id: f.id, file_name: f.file_name, file_url: f.file_url, file_size: f.file_size, created_at: f.created_at,
      }));
      setExistingFiles(files);
    } catch (error) {
      console.error('Error fetching existing files:', error);
    }
  };

  const removeExistingFile = async (fileId: string) => {
    try {
      const { error } = await supabase.from('task_files').delete().eq('task_id', task.id).eq('file_id', fileId);
      if (error) throw error;
      setExistingFiles(prev => prev.filter(f => f.id !== fileId));
      toast({ title: "File removed" });
    } catch {
      toast({ title: "Error removing file", variant: "destructive" });
    }
  };

  const uploadFiles = async (taskId: string): Promise<void> => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const filePath = `${projectName || task.project_id}/${taskId}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from('Files').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('Files').getPublicUrl(filePath);
        const { data: fileRecord, error: fileError } = await supabase
          .from('files')
          .insert({
            file_name: file.name, file_path: filePath, file_url: filePath,
            file_size: file.size, file_type: file.type, project_id: task.project_id,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id, description: 'Task outcome file'
          })
          .select('id').single();
        if (fileError) throw fileError;
        const { error: tfError } = await supabase.from('task_files').insert({ task_id: taskId, file_id: fileRecord.id });
        if (tfError) throw tfError;
      }
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getUserEmail = (userId: string) => {
    const user = authUsers.find(u => u.id === userId);
    return user?.email || userId || '—';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let updateData: any = {};
      const previousAssignedTo = task.assigned_to;

      if (isAdmin) {
        updateData = {
          task_name: formData.taskName,
          task_type: formData.taskType,
          priority: formData.priority,
          status: formData.status,
          assigned_to: formData.assignedTo === 'unassigned' ? null : formData.assignedTo || null,
          assigned_by: formData.assignedBy === 'unassigned' ? null : formData.assignedBy || null,
          follow_by: formData.followBy === 'unassigned' ? null : formData.followBy || null,
          confirm_by: formData.confirmBy === 'unassigned' ? null : formData.confirmBy || null,
          description: formData.description,
          notes: formData.notes,
          outcome_notes: formData.outcomeNotes,
          related_task_id: formData.relatedTaskId === 'none' ? null : formData.relatedTaskId || null,
          due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
          start_time: startDate ? startDate.toISOString() : null,
          predecessor_task_id: formData.predecessorTaskId === 'none' ? null : formData.predecessorTaskId || null,
          successor_task_id: formData.successorTaskId === 'none' ? null : formData.successorTaskId || null,
        };


        // Auto-set completed_at and completed_by
        if (formData.status === 'completed' && task.status !== 'completed') {
          const { data: { user } } = await supabase.auth.getUser();
          updateData.completed_at = new Date().toISOString();
          updateData.completed_by = user?.id || null;
        } else if (formData.status !== 'completed' && task.status === 'completed') {
          updateData.completed_at = null;
          updateData.completed_by = null;
        }

        // Auto-set canceled_at and canceled_by
        if (formData.status === 'cancelled' && task.status !== 'cancelled') {
          const { data: { user: cancelUser } } = await supabase.auth.getUser();
          updateData.canceled_at = new Date().toISOString();
          updateData.canceled_by = cancelUser?.id || null;
        } else if (formData.status !== 'cancelled' && task.status === 'cancelled') {
          updateData.canceled_at = null;
          updateData.canceled_by = null;
        }
      } else {
        updateData = {
          outcome_notes: userOutcomeNotes,
          status: userStatus,
        };

        // Auto-set completed_at and completed_by for non-admin
        if (userStatus === 'completed' && task.status !== 'completed') {
          const { data: { user } } = await supabase.auth.getUser();
          updateData.completed_at = new Date().toISOString();
          updateData.completed_by = user?.id || null;
        } else if (userStatus !== 'completed' && task.status === 'completed') {
          updateData.completed_at = null;
          updateData.completed_by = null;
        }

        // Auto-set canceled_at and canceled_by for non-admin
        if (userStatus === 'cancelled' && task.status !== 'cancelled') {
          const { data: { user: cancelUser } } = await supabase.auth.getUser();
          updateData.canceled_at = new Date().toISOString();
          updateData.canceled_by = cancelUser?.id || null;
        } else if (userStatus !== 'cancelled' && task.status === 'cancelled') {
          updateData.canceled_at = null;
          updateData.canceled_by = null;
        }
      }

      // Upload description audio blob if recorded and transcribe
      if (descriptionAudioBlob) {
        try {
          const timestamp = Date.now();
          const audioPath = `task-audio/${task.id}/desc-${timestamp}.webm`;
          const { error: audioUploadError } = await supabase.storage.from('Files').upload(audioPath, descriptionAudioBlob, {
            contentType: 'audio/webm',
          });
          if (!audioUploadError) {
            updateData.description_audio_path = audioPath;
          }
          const transcription = await transcribeAudioBlob(descriptionAudioBlob);
          if (transcription) {
            updateData.description_audio_transcription = transcription;
          }
        } catch (audioErr) {
          console.error('Error uploading/transcribing description audio:', audioErr);
        }
      }

      // Upload outcome audio blob if recorded and transcribe
      if (outcomeAudioBlob) {
        try {
          const timestamp = Date.now();
          const audioPath = `task-audio/${task.id}/${timestamp}.webm`;
          const { error: audioUploadError } = await supabase.storage.from('Files').upload(audioPath, outcomeAudioBlob, {
            contentType: 'audio/webm',
          });
          if (!audioUploadError) {
            updateData.outcome_audio_path = audioPath;
            setOutcomeAudioUrl(audioPath);
          }
          const transcription = await transcribeAudioBlob(outcomeAudioBlob);
          if (transcription) {
            updateData.outcome_audio_transcription = transcription;
          }
        } catch (audioErr) {
          console.error('Error uploading/transcribing outcome audio:', audioErr);
        }
      }

      const { error: updateError } = await supabase.from('tasks').update(updateData).eq('id', task.id);
      if (updateError) throw updateError;

      await uploadFiles(task.id);

      if (isAdmin && formData.assignedTo && formData.assignedTo !== 'unassigned' && formData.assignedTo !== previousAssignedTo) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && formData.assignedTo !== user.id) {
          await sendNotification(
            '📋 Task Reassigned',
            `You have been assigned: "${formData.taskName}"`,
            [formData.assignedTo],
            'task',
            `/projects/${task.project_id}`
          );
        }
      }

      toast({
        title: "Task updated successfully",
        description: isAdmin ? "All task fields have been updated." : "Your task update has been saved."
      });
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({ title: "Error updating task", description: "Failed to update the task.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  if (!task) return null;

  const readOnlyStyle = "bg-[#f5f5f5] rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isAdmin ? 'Edit Task' : 'Update Task Outcome'}</DialogTitle>
          <DialogDescription>
            {projectName && <span>Project: <strong>{projectName}</strong></span>}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] pr-6">
            <div className="grid gap-4 py-4">

              {/* 1. Task Name */}
              <div className="grid gap-2">
                <Label>Task Name *</Label>
                {isAdmin ? (
                  <Input
                    value={formData.taskName}
                    onChange={(e) => handleInputChange('taskName', e.target.value)}
                    placeholder="Enter task name"
                    required
                  />
                ) : (
                  <div className={readOnlyStyle}>{formData.taskName || '—'}</div>
                )}
              </div>

              {/* 2. Description */}
              <div className="grid gap-2">
                <Label>Description</Label>
                {isAdmin ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the task in detail..."
                    rows={5}
                  />
                ) : (
                  <div className={cn(readOnlyStyle, "min-h-[60px] whitespace-pre-wrap")}>{formData.description || '—'}</div>
                )}
              </div>

              {/* 3. Description Voice Recorder (admin only) */}
              {isAdmin && (
                <TaskVoiceRecorderBox
                  label="Record Description"
                  onAudioReady={(blob) => setDescriptionAudioBlob(blob)}
                  disabled={loading}
                />
              )}

              {/* 4. Related Task */}
              <div className="grid gap-2">
                <Label>Related Task</Label>
                {isAdmin ? (
                  <Select value={formData.relatedTaskId} onValueChange={(v) => handleInputChange('relatedTaskId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a related task (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No related task</SelectItem>
                      {relatedTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.task_name || '—'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={readOnlyStyle}>
                    {formData.relatedTaskId && formData.relatedTaskId !== 'none'
                      ? (relatedTasks.find(t => t.id === formData.relatedTaskId)?.task_name || '—')
                      : '—'}
                  </div>
                )}
              </div>

              {/* Predecessor Task */}
              <div className="grid gap-2">
                <Label>Predecessor Task</Label>
                {isAdmin ? (
                  <Select value={formData.predecessorTaskId} onValueChange={(v) => handleInputChange('predecessorTaskId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select predecessor task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {relatedTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.task_name || '—'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={readOnlyStyle}>
                    {formData.predecessorTaskId && formData.predecessorTaskId !== 'none'
                      ? (relatedTasks.find(t => t.id === formData.predecessorTaskId)?.task_name || '—')
                      : '—'}
                  </div>
                )}
              </div>

              {/* Successor Task */}
              <div className="grid gap-2">
                <Label>Successor Task</Label>
                {isAdmin ? (
                  <Select value={formData.successorTaskId} onValueChange={(v) => handleInputChange('successorTaskId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select successor task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {relatedTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.task_name || '—'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={readOnlyStyle}>
                    {formData.successorTaskId && formData.successorTaskId !== 'none'
                      ? (relatedTasks.find(t => t.id === formData.successorTaskId)?.task_name || '—')
                      : '—'}
                  </div>
                )}
              </div>

              {/* 5. Assigned By / Assigned To */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Assigned By</Label>
                  {isAdmin ? (
                    <Select value={formData.assignedBy} onValueChange={(v) => handleInputChange('assignedBy', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who assigned this task" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {authUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={readOnlyStyle}>{getUserEmail(formData.assignedBy)}</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Assigned To</Label>
                  {isAdmin ? (
                    <Select value={formData.assignedTo} onValueChange={(v) => handleInputChange('assignedTo', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {authUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={readOnlyStyle}>{getUserEmail(formData.assignedTo)}</div>
                  )}
                </div>
              </div>

              {/* 6. Follow Up By / Confirm By */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Follow Up By</Label>
                  {isAdmin ? (
                    <Select value={formData.followBy} onValueChange={(v) => handleInputChange('followBy', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who will follow up" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {authUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={readOnlyStyle}>{getUserEmail(formData.followBy)}</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Confirm By</Label>
                  {isAdmin ? (
                    <Select value={formData.confirmBy} onValueChange={(v) => handleInputChange('confirmBy', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who will confirm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {authUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={readOnlyStyle}>{getUserEmail(formData.confirmBy)}</div>
                  )}
                </div>
              </div>

              {/* 7. Start Date / Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  {isAdmin ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="p-3 pointer-events-auto" initialFocus />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className={readOnlyStyle}>{startDate ? format(startDate, "PPP") : '—'}</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  {isAdmin ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} className="p-3 pointer-events-auto" initialFocus />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className={readOnlyStyle}>{dueDate ? format(dueDate, "PPP") : '—'}</div>
                  )}
                </div>
              </div>

              {/* 8. Priority / Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  {isAdmin ? (
                    <Select value={formData.priority} onValueChange={(v) => handleInputChange('priority', v)}>
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
                  ) : (
                    <div className={readOnlyStyle}>{formData.priority}</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  {isAdmin ? (
                    <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
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
                  ) : (
                    <div className={readOnlyStyle}>{formData.status === 'in_progress' ? 'In Progress' : formData.status === 'completed' ? 'Completed' : formData.status}</div>
                  )}
                </div>
              </div>

              {/* 9. Notes */}
              <div className="grid gap-2">
                <Label>Notes</Label>
                {isAdmin ? (
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this task"
                    rows={5}
                  />
                ) : (
                  <div className={cn(readOnlyStyle, "min-h-[60px] whitespace-pre-wrap")}>{formData.notes || '—'}</div>
                )}
              </div>

              {/* 10. Outcome Notes */}
              <div className="grid gap-2">
                <Label>Outcome Notes</Label>
                {isAdmin ? (
                  <Textarea
                    value={formData.outcomeNotes}
                    onChange={(e) => handleInputChange('outcomeNotes', e.target.value)}
                    placeholder="Notes about the expected or achieved outcome"
                    rows={5}
                  />
                ) : (
                  <div className={cn(readOnlyStyle, "min-h-[60px] whitespace-pre-wrap")}>{formData.outcomeNotes || '—'}</div>
                )}
              </div>

              {/* 11. Outcome Voice Recorder (admin) */}
              {isAdmin && (
                <div className="grid gap-2">
                  <TaskVoiceRecorderBox
                    label="Record Outcome"
                    onAudioReady={(blob) => setOutcomeAudioBlob(blob)}
                    disabled={loading}
                  />
                  {outcomeAudioUrl && (
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <audio controls src={outcomeAudioUrl} className="h-8 w-full" />
                    </div>
                  )}
                </div>
              )}

              {/* ============ NON-ADMIN: Your Task Update Section ============ */}
              {!isAdmin && (
                <div className="border-l-4 border-blue-400 pl-4 mt-6 space-y-4">
                  <h3 className="font-medium text-base">Your Task Update</h3>

                  {/* Status - limited */}
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={userStatus} onValueChange={setUserStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Outcome Notes */}
                  <div className="grid gap-2">
                    <Label>Outcome Notes</Label>
                    <Textarea
                      value={userOutcomeNotes}
                      onChange={(e) => setUserOutcomeNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {/* ============ FILE UPLOAD (all users) ============ */}
              <div className="grid gap-2">
                <Label>Outcome File</Label>

                {/* Existing files */}
                {existingFiles.length > 0 && (
                  <Card className="mb-2">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">Existing Files</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
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
                            <div className="flex items-center gap-1">
                              <Button type="button" variant="ghost" size="sm" onClick={() => window.open(file.file_url, '_blank')}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeExistingFile(file.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upload area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">Upload a file related to this outcome</p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedFiles(prev => [...prev, ...files]);
                      }}
                      className="hidden"
                      id="edit-outcome-file-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="edit-outcome-file-upload"
                      className={cn(
                        "inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 text-sm",
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
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}>
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
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
