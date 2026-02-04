import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, X } from 'lucide-react';

interface NewFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onFileCreated: () => void;
}

export const NewFileDialog: React.FC<NewFileDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onFileCreated,
}) => {
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  const { toast } = useToast();

  // Fetch project name when dialog opens
  useEffect(() => {
    if (open && projectId) {
      fetchProjectName();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload file to Supabase storage with new path structure
      const fileId = crypto.randomUUID();
      const filePath = `${projectName}/${fileId}/${selectedFile.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Files')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create file record
      const { error: insertError } = await supabase
        .from('files')
        .insert({
          uploaded_by: user.id,
          project_id: projectId,
          file_name: selectedFile.name,
          file_path: uploadData.path,
          file_url: uploadData.path,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          description: description.trim() || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      // Reset form
      setFileName('');
      setDescription('');
      setSelectedFile(null);
      onOpenChange(false);
      onFileCreated();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload a file to this project. All file formats are supported.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* File Upload Section */}
            <div className="grid gap-2">
              <Label htmlFor="file">Upload File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a file to upload
                  </p>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        if (!fileName) {
                          setFileName(file.name);
                        }
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                    required
                  />
                  <label 
                    htmlFor="file-upload" 
                    className={`inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </label>
                </div>
              </div>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileName('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the file..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};