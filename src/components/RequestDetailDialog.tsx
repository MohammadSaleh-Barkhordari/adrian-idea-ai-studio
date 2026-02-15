import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FileText, Download, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
}

export function RequestDetailDialog({ open, onOpenChange, request }: RequestDetailDialogProps) {
  const [descriptionAudioUrl, setDescriptionAudioUrl] = useState<string | null>(null);
  const [responseAudioUrl, setResponseAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && request) {
      setDescriptionAudioUrl(null);
      setResponseAudioUrl(null);

      if (request.description_audio_path) {
        supabase.storage.from('Files').createSignedUrl(request.description_audio_path, 3600).then(({ data }) => {
          setDescriptionAudioUrl(data?.signedUrl || null);
        });
      }
      if (request.response_audio_path) {
        supabase.storage.from('Files').createSignedUrl(request.response_audio_path, 3600).then(({ data }) => {
          setResponseAudioUrl(data?.signedUrl || null);
        });
      }
    }
  }, [open, request]);

  const handleStorageDownload = async (path: string, bucket: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({ title: 'Download failed', description: 'Could not download the file.', variant: 'destructive' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (!request) return null;

  const readOnlyText = "text-sm text-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg">Request Details</DialogTitle>
          <DialogDescription>
            From: {request.request_by}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 py-2">

            {/* Description */}
            {request.description && (
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className={cn(readOnlyText, "whitespace-pre-wrap break-words mt-1")}>{request.description}</p>
              </div>
            )}

            {/* Description Audio */}
            {descriptionAudioUrl && (
              <div>
                <Label className="text-xs text-muted-foreground">Description Audio</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <audio controls src={descriptionAudioUrl} className="h-8 w-full" />
                </div>
              </div>
            )}

            {/* Description Transcription */}
            {request.description_audio_transcription && (
              <div>
                <Label className="text-xs text-muted-foreground">Audio Transcription</Label>
                <p className={cn(readOnlyText, "whitespace-pre-wrap break-words mt-1 italic")}>{request.description_audio_transcription}</p>
              </div>
            )}

            {/* Priority / Status */}
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <div className="mt-1">
                  <Badge variant={getPriorityColor(request.priority) as any} className="capitalize">{request.priority}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="capitalize">{request.status?.replace('_', ' ')}</Badge>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Due Date</Label>
                <p className={readOnlyText}>{request.due_date ? format(new Date(request.due_date), 'PPP') : '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Created At</Label>
                <p className={readOnlyText}>{format(new Date(request.created_at), 'PPP')}</p>
              </div>
            </div>

            {/* Response Section */}
            {(request.response || responseAudioUrl || request.response_audio_transcription || (request.response_files_path && request.response_files_path.length > 0)) && (
              <div className="border-l-4 border-primary/40 pl-4 mt-4 space-y-3">
                <h3 className="font-medium text-base">Response</h3>

                {request.response && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Response Text</Label>
                    <p className={cn(readOnlyText, "whitespace-pre-wrap break-words mt-1")}>{request.response}</p>
                  </div>
                )}

                {responseAudioUrl && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Response Audio</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <audio controls src={responseAudioUrl} className="h-8 w-full" />
                    </div>
                  </div>
                )}

                {request.response_audio_transcription && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Response Transcription</Label>
                    <p className={cn(readOnlyText, "whitespace-pre-wrap break-words mt-1 italic")}>{request.response_audio_transcription}</p>
                  </div>
                )}

                {request.responded_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Responded At</Label>
                    <p className={readOnlyText}>{format(new Date(request.responded_at), 'PPP p')}</p>
                  </div>
                )}

                {/* Response Files */}
                {request.response_files_path && request.response_files_path.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Response Files</Label>
                    <Card className="mt-1">
                      <CardContent className="p-3 space-y-2">
                        {request.response_files_path.map((filePath: string, index: number) => {
                          const fileName = filePath.split('/').pop() || `file-${index + 1}`;
                          return (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 shrink-0" />
                                <span className="text-sm truncate">{fileName}</span>
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => handleStorageDownload(filePath, 'Files', fileName)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
