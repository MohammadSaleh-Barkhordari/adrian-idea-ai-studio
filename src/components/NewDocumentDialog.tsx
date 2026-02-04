import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, X } from 'lucide-react';

interface NewDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onDocumentCreated: () => void;
}

export const NewDocumentDialog: React.FC<NewDocumentDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onDocumentCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{title: string, summary: string} | null>(null);
  const { toast } = useToast();

  const analyzeDocument = async (file: File) => {
    setAnalyzing(true);
    setAiSuggestions(null);

    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just base64
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          fileData,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) {
        console.error('Document analysis error:', error);
        toast({
          title: "AI Analysis",
          description: "Could not analyze document with AI",
          variant: "destructive",
        });
        return;
      }

      if (data?.suggestedTitle || data?.suggestedSummary) {
        setAiSuggestions({
          title: data.suggestedTitle || '',
          summary: data.suggestedSummary || ''
        });
        
        // Auto-populate fields with AI suggestions
        if (data.suggestedTitle) setTitle(data.suggestedTitle);
        if (data.suggestedSummary) setContent(data.suggestedSummary);
        
        toast({
          title: "✨ AI Suggestions Generated!",
          description: "Title and summary have been suggested by AI",
        });
      } else {
        toast({
          title: "AI Analysis",
          description: "Could not generate AI suggestions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast({
        title: "Error",
        description: "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show warning for very large files
    if (file.size > 100 * 1024 * 1024) { // 100MB warning
      toast({
        title: "Large File",
        description: "Large files may take longer to process and analyze.",
        variant: "default",
      });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only PDF, Word, Excel, text files, and images are allowed",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill title with filename (without extension) as fallback
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setTitle(nameWithoutExt);
    
    // Check file size for AI analysis (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Selected",
        description: "File uploaded successfully. AI analysis not available for files over 10MB - please fill in details manually.",
        variant: "default",
      });
      return;
    }
    
    toast({
      title: "File Selected",
      description: "File selected successfully, analyzing with AI...",
    });
    
    // Automatically analyze the document with AI (only for files <= 10MB)
    analyzeDocument(file);
  };

  // Sanitize filename for Supabase Storage (removes non-ASCII characters)
  const sanitizeFilename = (filename: string) => {
    // Get file extension
    const lastDotIndex = filename.lastIndexOf('.');
    const extension = lastDotIndex > -1 ? filename.substring(lastDotIndex) : '';
    const nameWithoutExt = lastDotIndex > -1 ? filename.substring(0, lastDotIndex) : filename;
    
    // Replace non-ASCII characters and special characters with safe alternatives
    const sanitized = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\-_.]/g, '_') // Replace non-alphanumeric with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
    return sanitized + extension;
  };

  const handleFileUpload = async (user: any, projectName: string) => {
    if (!selectedFile) return null;

    // Generate document ID
    const documentId = crypto.randomUUID();
    
    // Create file path with sanitized filename for storage
    const sanitizedFilename = sanitizeFilename(selectedFile.name);
    const filePath = `${projectName}/${documentId}/${sanitizedFilename}`;

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      return {
        documentId,
        filePath: data.path,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type
      };
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Document upload started:', {
      title: title.trim(),
      hasFile: !!selectedFile,
      projectId,
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size
    });

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a document title",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create documents",
          variant: "destructive",
        });
        return;
      }

      console.log('User authenticated:', { userId: user.id, email: user.email });

      // Get project details for folder naming
      const { data: project, error: projectError } = await supabase
        .from('adrian_projects')
        .select('project_name')
        .eq('project_id', projectId)
        .single(); // Remove user_id filter to allow any authenticated user

      if (projectError || !project) {
        console.error('Project fetch error:', projectError);
        toast({
          title: "Project Error",
          description: `Project not found: ${projectError?.message || 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Project found:', project.project_name);

      // Handle file upload
      console.log('Starting file upload...');
      const uploadResult = await handleFileUpload(user, project.project_name);
      if (!uploadResult) {
        console.error('File upload returned null result');
        toast({
          title: "Upload Error",
          description: "Failed to upload file to storage",
          variant: "destructive",
        });
        return;
      }

      console.log('File uploaded successfully:', uploadResult);

      const documentData = {
        title: title.trim(),
        project_id: projectId,
        uploaded_by: user.id,
        id: uploadResult.documentId,
        file_path: uploadResult.filePath,
        file_url: uploadResult.filePath,
        file_name: uploadResult.fileName,
        file_size: uploadResult.fileSize,
        file_type: uploadResult.mimeType,
        summary: content.trim() || null,
      };

      console.log('Inserting document data:', documentData);

      const { data: insertedDocument, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Clean up uploaded file if database insert fails
        console.log('Cleaning up uploaded file due to database error...');
        await supabase.storage
          .from('documents')
          .remove([documentData.file_url]);
        
        toast({
          title: "Database Error",
          description: `Failed to save document: ${insertError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Document created successfully:', insertedDocument);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reset form and close dialog
      setTitle('');
      setContent('');
      setSelectedFile(null);
      setUploadProgress(0);
      onOpenChange(false);
      onDocumentCreated();

    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setSelectedFile(null);
    setUploadProgress(0);
    setAnalyzing(false);
    setAiSuggestions(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a file and provide a title and summary for this project document.
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
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif"
                    disabled={analyzing}
                    required
                  />
                  <label 
                    htmlFor="file-upload" 
                    className={`inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 ${analyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </label>
                  
                  {analyzing && (
                    <div className="mt-4">
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Analyzing document with AI...
                      </div>
                    </div>
                  )}
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
                        setTitle('');
                        setContent('');
                        setAiSuggestions(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {aiSuggestions && (
                    <div className="flex items-center mt-2 text-xs text-primary">
                      <span className="mr-1">✨</span>
                      AI suggestions applied
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document Title Section */}
            <div className="grid gap-2">
              <Label htmlFor="title" className="flex items-center">
                Document Title
                {aiSuggestions?.title && (
                  <span className="ml-2 text-xs text-primary">✨ AI suggested</span>
                )}
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                required
              />
            </div>
            
            {/* Content/Summary Section */}
            <div className="grid gap-2">
              <Label htmlFor="content" className="flex items-center">
                Summary (Optional)
                {aiSuggestions?.summary && (
                  <span className="ml-2 text-xs text-primary">✨ AI suggested</span>
                )}
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter a brief summary or description of the document..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedFile}>
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};