import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContractData {
  contractId: string | null;
  name: string | null;
  surname: string | null;
  homeAddress: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  nationalId: string | null;
  jobTitle: string | null;
  department: string | null;
  employmentType: string;
  startDate: string | null;
  endDate: string | null;
  contractDuration: string | null;
  salary: string | null;
  payFrequency: string;
  workEmail: string | null;
  summary: string;
}

interface ContractUploadProps {
  onDataExtracted: (data: ContractData) => void;
  onFileUploaded: (fileUrl: string, fileName: string) => void;
}

const ContractUpload = ({ onDataExtracted, onFileUploaded }: ContractUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [extractedData, setExtractedData] = useState<ContractData | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileId = crypto.randomUUID();
      const filePath = `contracts/${fileId}/${file.name}`;

      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setUploadedFile({ name: file.name, url: filePath });
      onFileUploaded(filePath, file.name);

      toast({
        title: "File uploaded successfully",
        description: "Starting AI analysis...",
      });

      // Start AI analysis
      setAnalyzing(true);
      
      // Convert file to base64 for AI analysis
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
            'analyze-contract',
            {
              body: {
                fileData: base64Data,
                fileName: file.name,
                fileType: file.type
              }
            }
          );

          if (analysisError) throw analysisError;

          const contractData = analysisResult.extractedData;
          setExtractedData(contractData);
          onDataExtracted(contractData);

          toast({
            title: "Contract analyzed successfully",
            description: "Review and edit the extracted information below.",
          });

        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis failed",
            description: "Could not extract contract data. Please fill manually.",
            variant: "destructive",
          });
        } finally {
          setAnalyzing(false);
        }
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload contract file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [onDataExtracted, onFileUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    noKeyboard: true,
    noClick: false
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : uploadedFile ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              
              <div>
                {uploading ? (
                  <p className="text-sm text-muted-foreground">Uploading contract...</p>
                ) : uploadedFile ? (
                  <div>
                    <p className="font-medium text-green-600">File uploaded successfully</p>
                    <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">
                      {isDragActive ? 'Drop your contract here' : 'Upload employment contract'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or tap below to select (PDF, DOC, DOCX, TXT)
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); open(); }} className="mt-3 min-h-[44px] min-w-[44px]">
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">AI is analyzing your contract...</p>
                <p className="text-sm text-muted-foreground">
                  Extracting key information from the document
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {extractedData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-600">Contract analysis complete</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {extractedData.summary}
                </p>
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Extracted Information:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {extractedData.contractId && (
                      <span>Contract ID: {extractedData.contractId}</span>
                    )}
                    {extractedData.nationalId && (
                      <span>National ID: {extractedData.nationalId}</span>
                    )}
                    {(extractedData.name || extractedData.surname) && (
                      <span>Employee: {`${extractedData.name || ''} ${extractedData.surname || ''}`.trim()}</span>
                    )}
                    {extractedData.jobTitle && (
                      <span>Job Title: {extractedData.jobTitle}</span>
                    )}
                    {extractedData.department && (
                      <span>Department: {extractedData.department}</span>
                    )}
                    {extractedData.phoneNumber && (
                      <span>Phone: {extractedData.phoneNumber}</span>
                    )}
                    {extractedData.dateOfBirth && (
                      <span>Date of Birth: {extractedData.dateOfBirth}</span>
                    )}
                    {extractedData.startDate && (
                      <span>Start Date: {extractedData.startDate}</span>
                    )}
                    {extractedData.endDate && (
                      <span>End Date: {extractedData.endDate}</span>
                    )}
                    {extractedData.salary && (
                      <span>Salary: {extractedData.salary} ({extractedData.payFrequency})</span>
                    )}
                    {extractedData.workEmail && (
                      <span>Work Email: {extractedData.workEmail}</span>
                    )}
                  </div>
                  {extractedData.homeAddress && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Home Address:</span> {extractedData.homeAddress}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Review and edit the form fields below to ensure accuracy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractUpload;