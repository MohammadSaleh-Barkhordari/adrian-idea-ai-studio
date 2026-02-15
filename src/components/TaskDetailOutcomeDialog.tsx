import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Upload, X, FileText, Download, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TaskVoiceRecorderBox from '@/components/TaskVoiceRecorderBox';
import { transcribeAudioBlob } from '@/lib/transcribeAudio';

interface TaskDetailOutcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
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

export function TaskDetailOutcomeDialog({ open, onOpenChange, task, onTaskUpdated }: TaskDetailOutcomeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<FileItem[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [projectName, setProjectName] = useState('');
  const [relatedTasks, setRelatedTasks] = useState<RelatedTask[]>([]);

  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [outcomeAudioBlob, setOutcomeAudioBlob] = useState<Blob | null>(null);
  const [outcomeAudioUrl, setOutcomeAudioUrl] = useState<string | null>(null);
  const [descriptionAudioUrl, setDescriptionAudioUrl] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (open && task) {
      setOutcomeNotes(task.outcome_notes || '');
      setStatus(task.status === 'completed' ? 'completed' : task.status === 'in_progress' ? 'in_progress' : 'in_progress');
      setSelectedFiles([]);
      setOutcomeAudioBlob(null);
      setOutcomeAudioUrl(task.outcome_audio_path ? null : null);
      setDescriptionAudioUrl(null);

      // Build signed URLs for audio playback (private bucket)
      if (task.outcome_audio_path) {
        supabase.storage.from('Files').createSignedUrl(task.outcome_audio_path, 3600).then(({ data }) => {
          setOutcomeAudioUrl(data?.signedUrl || null);
        });
      }
      if (task.description_audio_path) {
        supabase.storage.from('Files').createSignedUrl(task.description_audio_path, 3600).then(({ data }) => {
          setDescriptionAudioUrl(data?.signedUrl || null);
        });
      }

      fetchAuthUsers();
      fetchExistingFiles();
      fetchProjectName();
      if (task.predecessor_task_id || task.successor_task_id) {
        fetchRelatedTaskNames();
      }
    }
  }, [open, task]);

  const fetchProjectName = async () => {
    if (!task?.project_id) { setProjectName(''); return; }
    try {
      const { data } = await supabase
        .from('adrian_projects')
        .select('project_name')
        .eq('project_id', task.project_id)
        .maybeSingle();
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

  const fetchRelatedTaskNames = async () => {
    const ids = [task.predecessor_task_id, task.successor_task_id].filter(Boolean);
    if (ids.length === 0) return;
    try {
      const { data } = await supabase
        .from('tasks')
        .select('id, task_name')
        .in('id', ids);
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

  const getUserEmail = (userId: string) => {
    const u = authUsers.find(a => a.id === userId);
    return u?.email || '—';
  };

  const getTaskName = (taskId: string) => {
    const t = relatedTasks.find(rt => rt.id === taskId);
    return t?.task_name || '—';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return s;
    }
  };

  const getTaskTypeLabel = (t: string) => {
    switch (t) {
      case 'general': return 'General';
      case 'meeting': return 'Meeting';
      case 'follow_up': return 'Follow Up';
      case 'review': return 'Review';
      case 'delivery': return 'Delivery';
      default: return t;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData: any = {
        outcome_notes: outcomeNotes,
        status: status,
      };

      // Auto-set completed_at and completed_by
      if (status === 'completed' && task.status !== 'completed') {
        const { data: { user } } = await supabase.auth.getUser();
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id || null;
      } else if (status !== 'completed' && task.status === 'completed') {
        updateData.completed_at = null;
        updateData.completed_by = null;
      }

      // Upload outcome audio blob if recorded
      if (outcomeAudioBlob) {
        try {
          const timestamp = Date.now();
          const audioPath = `task-audio/${task.id}/${timestamp}.webm`;
          const { error: audioUploadError } = await supabase.storage.from('Files').upload(audioPath, outcomeAudioBlob, {
            contentType: 'audio/webm',
          });
          if (!audioUploadError) {
            updateData.outcome_audio_path = audioPath;
          }
          const transcription = await transcribeAudioBlob(outcomeAudioBlob);
          if (transcription) {
            updateData.outcome_audio_transcription = transcription;
          }
        } catch (audioErr) {
          console.error('Error uploading/transcribing outcome audio:', audioErr);
        }
      }

      // Check if files will be uploaded
      if (selectedFiles.length > 0 || existingFiles.length > 0) {
        updateData.outcome_has_files = true;
      }

      const { error: updateError } = await supabase.from('tasks').update(updateData).eq('id', task.id);
      if (updateError) throw updateError;

      await uploadFiles(task.id);

      toast({
        title: "Outcome updated",
        description: "Your task outcome has been saved."
      });
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({ title: "Error updating outcome", description: "Failed to save.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  const readOnlyText = "text-sm text-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg">{task.task_name || 'Task Detail'}</DialogTitle>
          <DialogDescription>
            {projectName && (
              <Link to={`/projects/${task.project_id}`} className="text-primary hover:underline">
                Project: {projectName}
              </Link>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 py-2">

              {/* ====== READ-ONLY SECTION ====== */}

              {/* Description */}
              {task.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className={cn(readOnlyText, "whitespace-pre-wrap mt-1")}>{task.description}</p>
                  {descriptionAudioUrl && (
                    <div className="flex items-center gap-2 mt-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <audio controls src={descriptionAudioUrl} className="h-8 w-full" />
                    </div>
                  )}
                </div>
              )}

              {/* People grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Assigned By</Label>
                  <p className={readOnlyText}>{task.assigned_by ? getUserEmail(task.assigned_by) : '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Assigned To</Label>
                  <p className={readOnlyText}>{task.assigned_to ? getUserEmail(task.assigned_to) : '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Follow Up By</Label>
                  <p className={readOnlyText}>{task.follow_by ? getUserEmail(task.follow_by) : '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Confirm By</Label>
                  <p className={readOnlyText}>{task.confirm_by ? getUserEmail(task.confirm_by) : '—'}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <p className={readOnlyText}>{task.start_time ? format(new Date(task.start_time), 'PPP') : '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <p className={readOnlyText}>{task.due_date ? format(new Date(task.due_date), 'PPP') : '—'}</p>
                </div>
              </div>

              {/* Priority / Status / Type */}
              <div className="flex flex-wrap gap-3 items-center">
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <div className="mt-1">
                    <Badge variant={getPriorityColor(task.priority) as any} className="capitalize">{task.priority}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{getStatusLabel(task.status)}</Badge>
                  </div>
                </div>
                {task.task_type && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Task Type</Label>
                    <p className={cn(readOnlyText, "mt-1")}>{getTaskTypeLabel(task.task_type)}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {task.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className={cn(readOnlyText, "whitespace-pre-wrap mt-1")}>{task.notes}</p>
                </div>
              )}

              {/* Predecessor / Successor */}
              {(task.predecessor_task_id || task.successor_task_id) && (
                <div className="grid grid-cols-2 gap-3">
                  {task.predecessor_task_id && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Predecessor Task</Label>
                      <p className={readOnlyText}>{getTaskName(task.predecessor_task_id)}</p>
                    </div>
                  )}
                  {task.successor_task_id && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Successor Task</Label>
                      <p className={readOnlyText}>{getTaskName(task.successor_task_id)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ====== EDITABLE OUTCOME SECTION ====== */}
              <div className="border-l-4 border-blue-400 pl-4 mt-4 space-y-4">
                <h3 className="font-medium text-base">Your Outcome</h3>

                {/* Status */}
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Outcome Notes */}
                <div className="grid gap-2">
                  <Label>Outcome Notes</Label>
                  <Textarea
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    placeholder="Describe the outcome of your work..."
                    rows={5}
                  />
                </div>

                {/* Outcome Voice Recorder */}
                <TaskVoiceRecorderBox
                  label="Record Outcome"
                  onAudioReady={(blob) => setOutcomeAudioBlob(blob)}
                  disabled={loading}
                />

                {/* Play existing outcome audio */}
                {outcomeAudioUrl && !outcomeAudioBlob && (
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <audio controls src={outcomeAudioUrl} className="h-8 w-full" />
                  </div>
                )}

                {/* File Upload */}
                <div className="grid gap-2">
                  <Label>Outcome Files</Label>

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
                              <Button type="button" variant="ghost" size="sm" onClick={() => window.open(file.file_url, '_blank')}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">Upload outcome files</p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedFiles(prev => [...prev, ...files]);
                        }}
                        className="hidden"
                        id="outcome-detail-file-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="outcome-detail-file-upload"
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
            </div>
          </ScrollArea>

          <DialogFooter className="flex-col items-stretch gap-2 sm:flex-col">
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Update Outcome'}
              </Button>
            </div>
            {task.project_id && (
              <p className="text-xs text-muted-foreground text-center">
                To edit full task details, go to the{' '}
                <Link to={`/projects/${task.project_id}`} className="text-primary hover:underline">
                  project page
                </Link>
              </p>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
