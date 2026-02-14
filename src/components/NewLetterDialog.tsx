import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onLetterCreated: () => void;
}

export function NewLetterDialog({ open, onOpenChange, projectId, onLetterCreated }: NewLetterDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    title: string;
    summary: string;
    recipient_name: string;
    recipient_position: string;
    recipient_company: string;
    date: string;
    user_request: string;
    writer_name: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    recipientName: '',
    recipientPosition: '',
    recipientCompany: '',
    date: new Date().toISOString().split('T')[0],
    userRequest: '',
    writerName: ''
  });
  const { toast } = useToast();

  const analyzeDocument = async (file: File) => {
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('analyze-letter', {
        body: formData,
      });

      if (error) {
        console.error('Analysis error:', error);
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the letter. Please enter title and summary manually.",
          variant: "destructive",
        });
        return;
      }

      setAiSuggestions(data);
      // Pre-fill form with AI suggestions
      setFormData({
        title: data.title || '',
        summary: data.summary || '',
        recipientName: data.recipient_name || '',
        recipientPosition: data.recipient_position || '',
        recipientCompany: data.recipient_company || '',
        date: data.date || new Date().toISOString().split('T')[0],
        userRequest: data.user_request || '',
        writerName: data.writer_name || ''
      });
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your letter and filled in the form fields.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the letter. Please enter title and summary manually.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    // Show warning for very large files
    if (file.size > 100 * 1024 * 1024) { // 100MB warning
      toast({
        title: "Large File",
        description: "Large files may take longer to process and analyze.",
        variant: "default",
      });
    }

    setSelectedFile(file);
    setAiSuggestions(null);
    // Reset form data when new file selected
    setFormData({
      title: '',
      summary: '',
      recipientName: '',
      recipientPosition: '',
      recipientCompany: '',
      date: new Date().toISOString().split('T')[0],
      userRequest: '',
      writerName: ''
    });
    
    // Check file size for AI analysis (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File Selected",
        description: "File uploaded successfully. AI analysis not available for files over 20MB - please fill in letter details manually.",
        variant: "default",
      });
      return;
    }
    
    // Auto-analyze the document (only for files <= 20MB)
    analyzeDocument(file);
  };

  const sanitizeFilename = (filename: string): string => {
    return filename
      .replace(/[^\w\s.-]/g, '') // Remove non-ASCII and special characters except dots, hyphens, and spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .toLowerCase();
  };

  const handleFileUpload = async (user: any, projectName: string) => {
    if (!selectedFile) return null;

    try {
      const letterId = crypto.randomUUID();
      const sanitizedFilename = sanitizeFilename(selectedFile.name);
      const filePath = `${projectName}/${letterId}/${sanitizedFilename}`;

      const { data, error } = await supabase.storage
        .from('Letters')
        .upload(filePath, selectedFile);

      if (error) {
        console.error('Storage error:', error);
        throw new Error('Failed to upload file');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Letters')
        .getPublicUrl(filePath);

      return {
        letterId,
        fileUrl: filePath,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        publicUrl
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !formData.title.trim() || !formData.recipientName.trim() || !formData.recipientCompany.trim() || !formData.userRequest.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields: file, title, recipient name, company, and request.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload letters.",
          variant: "destructive",
        });
        return;
      }

      // Get project name
      const { data: project, error: projectError } = await supabase
        .from('adrian_projects')
        .select('project_name')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError || !project) {
        toast({
          title: "Project Error",
          description: "Could not find project information.",
          variant: "destructive",
        });
        return;
      }

      // Upload file
      const uploadResult = await handleFileUpload(user, project.project_name);
      if (!uploadResult) {
        throw new Error('File upload failed');
      }

      // Insert letter record
      const { error: insertError } = await supabase
        .from('letters')
        .insert({
          project_id: projectId,
          user_id: user.id,
          generated_subject: formData.title.trim(),
          recipient_name: formData.recipientName.trim(),
          recipient_position: formData.recipientPosition.trim() || '',
          recipient_company: formData.recipientCompany.trim(),
          user_request: formData.userRequest.trim(),
          date: formData.date,
          writer_name: formData.writerName.trim() || null,
          file_path: uploadResult.fileUrl,
          mime_type: uploadResult.mimeType,
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('Letters')
          .remove([uploadResult.fileUrl]);
        
        throw new Error('Failed to save letter information');
      }

      toast({
        title: "Letter Uploaded",
        description: "Your letter has been successfully uploaded to the project.",
      });

      onLetterCreated();
      handleClose();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed", 
        description: error instanceof Error ? error.message : "Failed to upload letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFormData({
      title: '',
      summary: '',
      recipientName: '',
      recipientPosition: '',
      recipientCompany: '',
      date: new Date().toISOString().split('T')[0],
      userRequest: '',
      writerName: ''
    });
    setIsAnalyzing(false);
    setAiSuggestions(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Letter</DialogTitle>
          <DialogDescription>
            Upload an existing letter file to your project. AI will automatically suggest a title and summary.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
            <Label htmlFor="letter-file">Letter File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                id="letter-file"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                disabled={isLoading || isAnalyzing}
              />
              <label
                htmlFor="letter-file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Click to upload letter
                </span>
                <span className="text-xs text-muted-foreground">
                  PDF, DOC, or DOCX files (no size limit)
                </span>
              </label>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
            )}
          </div>

          {/* AI Analysis Status */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                AI is analyzing your letter...
              </span>
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  AI Analysis Complete - Fields automatically filled
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Title:</strong> {aiSuggestions.title}</div>
                <div><strong>Writer:</strong> {aiSuggestions.writer_name || 'Not specified'}</div>
                <div><strong>Recipient:</strong> {aiSuggestions.recipient_name || 'Not specified'}</div>
                <div><strong>Company:</strong> {aiSuggestions.recipient_company || 'Not specified'}</div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="letter-title">Letter Title *</Label>
              <Input
                id="letter-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title for this letter"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name *</Label>
                <Input
                  id="recipient-name"
                  value={formData.recipientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="Enter recipient name"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient-position">Recipient Position</Label>
                <Input
                  id="recipient-position"
                  value={formData.recipientPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientPosition: e.target.value }))}
                  placeholder="Enter position/title"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-company">Recipient Company *</Label>
                <Input
                  id="recipient-company"
                  value={formData.recipientCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientCompany: e.target.value }))}
                  placeholder="Enter company name"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="letter-date">Letter Date</Label>
                <Input
                  id="letter-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-request">Letter Purpose/Request *</Label>
              <Textarea
                id="user-request"
                value={formData.userRequest}
                onChange={(e) => setFormData(prev => ({ ...prev, userRequest: e.target.value }))}
                placeholder="Describe the main purpose or request of this letter"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="writer-name">Writer Name (Optional)</Label>
              <Input
                id="writer-name"
                value={formData.writerName}
                onChange={(e) => setFormData(prev => ({ ...prev, writerName: e.target.value }))}
                placeholder="Enter writer/sender name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="letter-summary">Summary (Optional)</Label>
              <Textarea
                id="letter-summary"
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief description of the letter content"
                rows={2}
                disabled={isLoading}
              />
             </div>
           </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || isAnalyzing || !selectedFile || !formData.title.trim() || !formData.recipientName.trim() || !formData.recipientCompany.trim() || !formData.userRequest.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Letter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}