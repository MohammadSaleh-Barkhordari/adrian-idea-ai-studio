import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Upload, X, ArrowLeft } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import TaskVoiceRecorderBox from '@/components/TaskVoiceRecorderBox';
import { transcribeAudioBlob } from '@/lib/transcribeAudio';

interface User {
  id: string;
  email: string;
}

const CreateRequestPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [descriptionAudioBlob, setDescriptionAudioBlob] = useState<Blob | null>(null);
  
  const [formData, setFormData] = useState({
    requestTo: '',
    confirmBy: '',
    dueDate: '',
    priority: 'medium',
    description: ''
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchAllUsers();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data: users, error } = await supabase.functions.invoke('get-auth-users');
      
      if (error) throw error;
      
      // Get all users (no filtering needed)
      console.log('Loaded users:', users.users.length);
      setAllUsers(users.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };


  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (requestId: string) => {
    const uploadedFiles = [];
    
    for (const file of files) {
      const filePath = `Requests/${requestId}/${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('Files')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Save file record to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_url: `Files/${filePath}`,
          file_type: file.type,
          file_size: file.size,
          user_id: user.id,
          project_id: requestId,
          description: `File for request ${requestId}`
        });
      
      if (dbError) {
        console.error('Error saving file record:', dbError);
        throw dbError;
      }
      
      uploadedFiles.push(filePath);
    }
    
    return uploadedFiles;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      // Insert into the requests table
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          request_to: formData.requestTo,
          request_by: user.email || user.user_metadata?.full_name || 'Unknown',
          due_date: formData.dueDate || null,
          priority: formData.priority,
          description: formData.description,
          status: 'pending',
          confirm_by: formData.confirmBy || null,
        } as any)
        .select()
        .single();
      
      if (requestError) throw requestError;
      
      // Upload files if any
      if (files.length > 0) {
        await uploadFiles(request.id);
      }

      // Upload description audio if recorded
      if (descriptionAudioBlob) {
        const audioPath = `Requests/${request.id}/description_audio.webm`;
        const { error: audioUploadError } = await supabase.storage
          .from('Files')
          .upload(audioPath, descriptionAudioBlob, { contentType: 'audio/webm' });

        if (!audioUploadError) {
          await supabase
            .from('requests')
            .update({ description_audio_path: audioPath } as any)
            .eq('id', request.id);

          // Deferred transcription
          transcribeAudioBlob(descriptionAudioBlob).then(async (text) => {
            if (text) {
              await supabase
                .from('requests')
                .update({ description_audio_transcription: text } as any)
                .eq('id', request.id);
            }
          });
        }
      }
      
      toast({
        title: "Success",
        description: "Your request has been submitted successfully",
      });
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-8" dir="ltr">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Create Request</h1>
            <p className="text-muted-foreground">
              Submit a new request to administrators
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <CardTitle>Request Details</CardTitle>
              </div>
              <CardDescription>
                Fill out the form below to submit your request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="requestBy">Request By</Label>
                  <Input
                    id="requestBy"
                    value={user?.email || user?.user_metadata?.full_name || 'Unknown User'}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestTo">Request To</Label>
                  <Select value={formData.requestTo} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, requestTo: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an administrator" />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmBy">Confirm By (Optional)</Label>
                  <Select value={formData.confirmBy} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, confirmBy: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a person to confirm" />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your request in detail..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description Audio (Optional)</Label>
                  <TaskVoiceRecorderBox
                    label="Record Description"
                    onAudioReady={(blob) => setDescriptionAudioBlob(blob)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Request Files (Optional)</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive
                        ? 'Drop the files here...'
                        : 'Drag & drop files here, or click to select files'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All file formats are supported
                    </p>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label>Selected Files:</Label>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm text-foreground">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting || !formData.requestTo}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateRequestPage;