import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileImage, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FinancialData {
  from_entity: string;
  to_entity: string;
  amount: number;
  currency: string;
  transaction_type: 'income' | 'expense' | 'investment';
  description: string;
  transaction_date: string;
}

interface FinancialFileUploadProps {
  onFieldsExtracted: (fields: FinancialData, fileInfo?: {
    file: File;
    fileName: string;
    fileType: string;
  }) => void;
}

const FinancialFileUpload = ({ onFieldsExtracted }: FinancialFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image (JPG, PNG, WEBP) or PDF file.",
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

    // Check file size for AI analysis (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Upload",
        description: "File received successfully. AI analysis not available for files over 10MB - please enter financial details manually.",
        variant: "default",
      });
      
      // Call onFieldsExtracted with empty data to trigger manual entry mode
      onFieldsExtracted({
        from_entity: '',
        to_entity: '',
        amount: 0,
        currency: 'USD',
        transaction_type: 'expense',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      }, {
        file: file,
        fileName: file.name,
        fileType: file.type
      });
      
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 using chunked approach (mobile-safe)
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000; // 32KB chunks to avoid mobile memory issues
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binary);

      console.log('Processing financial document:', file.name, file.type);

      // Analyze document with edge function
      const response = await supabase.functions.invoke('analyze-financial-document', {
        body: {
          fileData: base64,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to analyze document');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Document analysis failed');
      }

      const extractedData = response.data.extractedData;
      
      // Apply extracted data with file info
      onFieldsExtracted(extractedData, {
        file: file,
        fileName: file.name,
        fileType: file.type
      });

      toast({
        title: "Document Analyzed Successfully",
        description: "Financial data has been extracted from your document. Review and edit as needed.",
      });
    } catch (error) {
      console.error('Error analyzing financial document:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Financial Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleInputChange}
          className="hidden"
          id="financial-file-upload"
          disabled={isUploading}
        />
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-accent bg-accent/10' 
              : 'border-muted-foreground/25 hover:border-accent/50'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-accent" />
                <p className="text-sm text-muted-foreground">
                  Analyzing document...
                </p>
              </>
            ) : (
              <>
                <FileImage className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium mb-1">
                    Drop your bill or receipt here, or tap below to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, WEBP, and PDF files (no size limit)
                  </p>
                </div>
                <label htmlFor="financial-file-upload">
                  <Button variant="outline" size="sm" disabled={isUploading} asChild>
                    <span className="min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer">Select File</span>
                  </Button>
                </label>
              </>
            )}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          AI will automatically extract transaction details for files under 10MB. 
          Larger files require manual data entry.
        </p>
      </CardContent>
    </Card>
  );
};

export default FinancialFileUpload;