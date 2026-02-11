import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image as ImageIcon, Trash2, Info, Camera } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import UserSelector from '@/components/UserSelector';

interface EmployeeFormDocumentsProps {
  formData: {
    user_id: string;
    profile_photo_url: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  employee: { id: string; user_id: string | null } | null;
  profilePhotoFile: File | null;
  setProfilePhotoFile: (file: File | null) => void;
  dataLoading: boolean;
}

interface EmployeeDocument {
  id: string;
  document_type: string;
  title: string | null;
  file_url: string;
  uploaded_at: string;
}

const DOCUMENT_TYPES = [
  { key: 'contract', label: 'Employment Contract', accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, multiple: false },
  { key: 'national_card', label: 'National Card / Cart Melli', accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/pdf': ['.pdf'] }, multiple: false },
  { key: 'shenasnameh', label: 'Shenasnameh', accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/pdf': ['.pdf'] }, multiple: false },
  { key: 'military_card', label: 'Military Card', accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/pdf': ['.pdf'] }, multiple: false },
  { key: 'degree', label: 'Degree / Certificate', accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/pdf': ['.pdf'] }, multiple: true },
  { key: 'other', label: 'Other Document', accept: {}, multiple: true },
];

const EmployeeFormDocuments = ({
  formData,
  setFormData,
  employee,
  profilePhotoFile,
  setProfilePhotoFile,
  dataLoading,
}: EmployeeFormDocumentsProps) => {
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState('');
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [otherTitle, setOtherTitle] = useState('');
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  const isNewEmployee = !employee;

  // Load existing documents for edit mode
  useEffect(() => {
    if (employee?.id) {
      loadDocuments();
    }
  }, [employee?.id]);

  // Set profile photo preview from existing URL
  useEffect(() => {
    if (formData.profile_photo_url) {
      setProfilePhotoPreview(formData.profile_photo_url);
    }
  }, [formData.profile_photo_url]);

  const loadDocuments = async () => {
    if (!employee?.id) return;
    const { data, error } = await supabase
      .from('employee_documents')
      .select('id, document_type, title, file_url, uploaded_at')
      .eq('employee_id', employee.id)
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  };

  const handleUserChange = (value: string, email?: string) => {
    if (!dataLoading) {
      setFormData((prev: any) => ({ ...prev, user_id: value }));
      if (email) setUserEmail(email);
    }
  };

  // Profile photo dropzone
  const onProfilePhotoDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    if (isNewEmployee) {
      // Buffer in local state for upload on submit
      setProfilePhotoFile(file);
    } else {
      // Upload immediately for existing employee
      uploadProfilePhoto(file);
    }
  }, [isNewEmployee, employee?.id]);

  const { getRootProps: getProfileRootProps, getInputProps: getProfileInputProps, isDragActive: isProfileDragActive } = useDropzone({
    onDrop: onProfilePhotoDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    multiple: false,
  });

  const uploadProfilePhoto = async (file: File) => {
    if (!employee?.id) return;
    setUploading('profile');
    try {
      const filePath = `${employee.id}/profile/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update employee record
      await supabase
        .from('employees')
        .update({ profile_photo_url: publicUrl })
        .eq('id', employee.id);

      setFormData((prev: any) => ({ ...prev, profile_photo_url: publicUrl }));
      toast({ title: 'Profile photo uploaded' });
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string, title?: string) => {
    if (!employee?.id) return;
    setUploading(documentType);
    try {
      const filePath = `${employee.id}/${documentType}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(filePath);

      // Insert document record
      const { error: dbError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employee.id,
          document_type: documentType,
          title: title || file.name,
          file_url: urlData.publicUrl,
        });

      if (dbError) throw dbError;

      toast({ title: 'Document uploaded successfully' });
      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (doc: EmployeeDocument) => {
    if (!employee?.id) return;
    try {
      // Extract storage path from URL
      const urlParts = doc.file_url.split('/employee-documents/');
      if (urlParts.length > 1) {
        const storagePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('employee-documents').remove([storagePath]);
      }

      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast({ title: 'Document deleted' });
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp)$/i.test(url);

  const getDocumentsForType = (type: string) =>
    documents.filter((d) => d.document_type === type);

  return (
    <div className="space-y-4">
      {/* Section 1: Associated User */}
      <Card>
        <CardHeader>
          <CardTitle>Associated User</CardTitle>
          <CardDescription>Link this employee to a system user account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserSelector
            value={formData.user_id}
            onValueChange={handleUserChange}
            required={true}
          />
          {userEmail && (
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground">Work Email:</Label>
              <Badge variant="secondary">{userEmail}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Upload a profile photo (JPG, PNG, WEBP)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              {profilePhotoPreview ? (
                <AvatarImage src={profilePhotoPreview} alt="Profile" />
              ) : null}
              <AvatarFallback className="text-2xl">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div
                {...getProfileRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isProfileDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getProfileInputProps()} />
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploading === 'profile' ? 'Uploading...' : 'Drop photo here or click to browse'}
                </p>
              </div>
              {isNewEmployee && profilePhotoFile && (
                <p className="text-xs text-muted-foreground mt-2">
                  Photo will be uploaded when you save the employee.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Document Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Upload employee documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isNewEmployee && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-muted">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Save the employee first to upload documents. You can add documents after creation.
              </p>
            </div>
          )}

          {DOCUMENT_TYPES.map((docType) => (
            <DocumentUploadZone
              key={docType.key}
              docType={docType}
              disabled={isNewEmployee}
              uploading={uploading}
              existingDocs={getDocumentsForType(docType.key)}
              onUpload={handleDocumentUpload}
              onDelete={handleDeleteDocument}
              isImage={isImage}
              otherTitle={otherTitle}
              setOtherTitle={setOtherTitle}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Sub-component for each document upload zone
interface DocumentUploadZoneProps {
  docType: (typeof DOCUMENT_TYPES)[number];
  disabled: boolean;
  uploading: string | null;
  existingDocs: EmployeeDocument[];
  onUpload: (file: File, type: string, title?: string) => void;
  onDelete: (doc: EmployeeDocument) => void;
  isImage: (url: string) => boolean;
  otherTitle: string;
  setOtherTitle: (v: string) => void;
}

const DocumentUploadZone = ({
  docType,
  disabled,
  uploading,
  existingDocs,
  onUpload,
  onDelete,
  isImage,
  otherTitle,
  setOtherTitle,
}: DocumentUploadZoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;
      acceptedFiles.forEach((file) => {
        onUpload(file, docType.key, docType.key === 'other' ? otherTitle || file.name : undefined);
      });
      if (docType.key === 'other') setOtherTitle('');
    },
    [disabled, docType.key, otherTitle, onUpload, setOtherTitle]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(docType.accept).length > 0 ? docType.accept : undefined,
    multiple: docType.multiple,
    disabled,
  });

  return (
    <div className="space-y-2">
      <Label className="font-medium">{docType.label}</Label>

      {docType.key === 'other' && !disabled && (
        <Input
          placeholder="Document title (optional)"
          value={otherTitle}
          onChange={(e) => setOtherTitle(e.target.value)}
          className="mb-2"
        />
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-muted'
            : isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4" />
          {uploading === docType.key ? 'Uploading...' : disabled ? 'Save employee first' : 'Drop file or click to upload'}
        </div>
      </div>

      {/* Existing documents */}
      {existingDocs.length > 0 && (
        <div className="space-y-2 mt-2">
          {existingDocs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-2 rounded-md border bg-muted/50">
              {isImage(doc.file_url) ? (
                <img src={doc.file_url} alt={doc.title || ''} className="h-10 w-10 rounded object-cover" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm flex-1 truncate">{doc.title || 'Untitled'}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeFormDocuments;

