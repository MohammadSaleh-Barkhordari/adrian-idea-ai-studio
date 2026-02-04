import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoiceRecorder from '@/components/VoiceRecorder';
import LetterBuilder from '@/components/LetterBuilder';

const WritingLetterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPosition, setRecipientPosition] = useState('');
  const [recipientCompany, setRecipientCompany] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [userRequest, setUserRequest] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<{
    subject_line: string;
    body: string;
    date: string;
    recipient_name: string;
    recipient_position: string;
    recipient_company: string;
  } | null>(null);
  const [editableSubject, setEditableSubject] = useState('');
  const [editableBody, setEditableBody] = useState('');
  const [currentLetter, setCurrentLetter] = useState<any>(null);
  const [showLetterBuilder, setShowLetterBuilder] = useState(false);
  
  const { toast } = useToast();

  const handleFieldsExtracted = async (fields: {
    recipientName: string;
    recipientPosition: string;
    recipientCompany: string;
    userRequest: string;
  }) => {
    setRecipientName(fields.recipientName);
    setRecipientPosition(fields.recipientPosition);
    setRecipientCompany(fields.recipientCompany);
    setUserRequest(fields.userRequest);

    // Create letter record with extracted fields and status
    if (user) {
      const { data: letterData, error } = await supabase
        .from('letters')
        .insert({
          created_by: user.id,
          project_id: selectedProject || null,
          document_id: selectedDocument || null,
          recipient_name: fields.recipientName,
          recipient_position: fields.recipientPosition,
          recipient_company: fields.recipientCompany,
          user_request: fields.userRequest,
          status: 'fields_extracted'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating letter:', error);
      } else if (letterData) {
        setGeneratedLetter({
          subject_line: letterData.subject || '',
          body: letterData.body || '',
          date: letterData.created_at.split('T')[0],
          recipient_name: letterData.recipient_name || '',
          recipient_position: letterData.recipient_position || '',
          recipient_company: letterData.recipient_company || ''
        });
      }
    }
  };

  const checkUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return;
      }
      
      const role = data?.role || 'general_user';
      setUserRole(role);
      
      // Redirect non-admin users
      if (role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    checkUser();
    
    // Check if a project was pre-selected from the project details page
    if (location.state?.selectedProjectId) {
      setSelectedProject(location.state.selectedProjectId);
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/auth');
        } else {
          setUser(session.user);
          fetchProjects();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.state]);

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  // Fetch documents when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      fetchDocuments(selectedProject);
    }
  }, [selectedProject]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      await fetchProjects();
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('adrian_projects')
        .select('project_id, project_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDocuments = async (projectId: string) => {
    if (!projectId) {
      setDocuments([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedDocument('');
    fetchDocuments(projectId);
  };

  const handleAILetterGeneration = async () => {
    if (!recipientName.trim() || !userRequest.trim()) {
      toast({
        title: "اطلاعات ناقص",
        description: "لطفاً نام گیرنده و درخواست کاربر را پر کنید.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // First, create a temporary letter record to get an ID
      const { data: letterData, error: insertError } = await supabase
        .from('letters')
        .insert({
          recipient_name: recipientName,
          recipient_position: recipientPosition || null,
          recipient_company: recipientCompany || null,
          date: date,
          project_id: selectedProject || null,
          document_id: selectedDocument || null,
          user_request: userRequest,
          writer_name: user?.user_metadata?.full_name || user?.email || 'Unknown',
          user_id: user.id,
          created_by: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Then, call the generate-letter function to add AI-generated content
      const { data: generateData, error: generateError } = await supabase.functions.invoke('generate-letter', {
        body: {
          letterId: letterData.id,
          recipientName: recipientName,
          recipientPosition: recipientPosition,
          recipientCompany: recipientCompany,
          userRequest: userRequest,
          projectId: selectedProject || null,
          documentId: selectedDocument || null,
          userId: user.id
        }
      });

      if (generateError) throw generateError;

      if (!generateData.success) {
        throw new Error(generateData.error || 'Failed to generate letter');
      }

      // Set the generated letter for display
      setGeneratedLetter({
        subject_line: generateData.subject_line,
        body: generateData.body,
        date: date,
        recipient_name: recipientName,
        recipient_position: recipientPosition,
        recipient_company: recipientCompany
      });

      // Set editable fields
      setEditableSubject(generateData.subject_line);
      setEditableBody(generateData.body);
      
      // Store current letter data for image generation and update status
      setCurrentLetter({
        ...letterData,
        status: 'letter_generated'
      });

      toast({
        title: "نامه تولید شد",
        description: "نامه شما با موفقیت تولید شد.",
      });

    } catch (error) {
      console.error('Error generating letter:', error);
      toast({
        title: "خطا",
        description: "خطا در تولید نامه. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedToComposition = async () => {
    try {
      // Update status to preview_generated when proceeding to composition
      if (currentLetter?.id) {
        await supabase
          .from('letters')
          .update({ status: 'preview_generated' })
          .eq('id', currentLetter.id);
        
        // Update current letter state
        setCurrentLetter(prev => ({ ...prev, status: 'preview_generated' }));
      }
      setShowLetterBuilder(true);
    } catch (error) {
      console.error('Error updating letter status:', error);
      setShowLetterBuilder(true); // Show builder anyway
    }
  };

  const handleLetterGenerated = () => {
    toast({
      title: "نامه تولید شد",
      description: "نامه شما با موفقیت دانلود شد.",
    });
  };

  const resetForm = () => {
    setRecipientName('');
    setRecipientPosition('');
    setRecipientCompany('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedProject('');
    setSelectedDocument('');
    setUserRequest('');
    setGeneratedLetter(null);
    setEditableSubject('');
    setEditableBody('');
    setCurrentLetter(null);
    setShowLetterBuilder(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-accent" />
              Writing a Letter
            </h1>
            <p className="text-muted-foreground">
              Create professional business letters with ease
            </p>
          </div>

          <div className="mb-6">
            <VoiceRecorder onFieldsExtracted={handleFieldsExtracted} />
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Compose New Letter</CardTitle>
              <CardDescription>
                Fill in the details below to create your letter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    placeholder="Enter recipient name..."
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPosition">Recipient Position</Label>
                  <Input
                    id="recipientPosition"
                    placeholder="Enter recipient position..."
                    value={recipientPosition}
                    onChange={(e) => setRecipientPosition(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientCompany">Recipient Company</Label>
                  <Input
                    id="recipientCompany"
                    placeholder="Enter recipient company..."
                    value={recipientCompany}
                    onChange={(e) => setRecipientCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={selectedProject} onValueChange={handleProjectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.project_id} value={project.project_id}>
                          {project.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Document</Label>
                  <Select 
                    value={selectedDocument} 
                    onValueChange={setSelectedDocument}
                    disabled={!selectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedProject ? "Select a document" : "Select project first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((document) => (
                        <SelectItem key={document.id} value={document.id}>
                          {document.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userRequest">User Request *</Label>
                <Textarea
                  id="userRequest"
                  placeholder="Write your request and reason for the letter here..."
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleAILetterGeneration}
                  className="flex items-center gap-2 bg-gradient-accent px-8"
                  size="lg"
                  disabled={isGenerating}
                >
                  <Sparkles className="h-5 w-5" />
                  {isGenerating ? "در حال تولید نامه..." : "AI Letter Generation"}
                </Button>
              </div>

              {/* Status Indicator */}
              {currentLetter && (
                <div className="mt-4 p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      currentLetter.status === 'fields_extracted' ? 'bg-yellow-500' :
                      currentLetter.status === 'letter_generated' ? 'bg-blue-500' :
                      currentLetter.status === 'preview_generated' ? 'bg-orange-500' :
                      currentLetter.status === 'final_generated' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">Status: {
                      currentLetter.status === 'fields_extracted' ? 'Fields Extracted' :
                      currentLetter.status === 'letter_generated' ? 'Letter Generated' :
                      currentLetter.status === 'preview_generated' ? 'Preview Generated' :
                      currentLetter.status === 'final_generated' ? 'Final Letter Ready' : currentLetter.status
                    }</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editable Generated Content */}
          {generatedLetter && (
            <Card className="glass mt-8">
              <CardHeader>
                <CardTitle>Generated Letter Content</CardTitle>
                <CardDescription>
                  Review and edit the generated subject and body before creating the final letter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="editableSubject">Subject</Label>
                  <Input
                    id="editableSubject"
                    value={editableSubject}
                    onChange={(e) => setEditableSubject(e.target.value)}
                    placeholder="Letter subject..."
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editableBody">Body</Label>
                  <Textarea
                    id="editableBody"
                    value={editableBody}
                    onChange={(e) => setEditableBody(e.target.value)}
                    placeholder="Letter body content..."
                    className="min-h-[200px] resize-none text-right"
                    dir="rtl"
                  />
                </div>

                {/* Proceed to Composition Section */}
                <div className="composition-section border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Create Final Letter</h3>
                  <p className="text-muted-foreground mb-4">
                    Proceed to the drag-and-drop composition mode to position your letter elements and generate the final image.
                  </p>
                  
                  <div className="flex justify-center">
                    <Button
                      onClick={handleProceedToComposition}
                      className="flex items-center gap-2 bg-gradient-accent px-8"
                      size="lg"
                    >
                      <FileText className="h-5 w-5" />
                      Proceed to Letter Composition
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Letter Builder Section */}
          {showLetterBuilder && generatedLetter && (
            <div className="mt-8">
              <LetterBuilder
                letterData={{
                  id: currentLetter?.id || '',
                  project_id: selectedProject,
                  document_id: selectedDocument || undefined,
                  recipientName: recipientName,
                  recipientPosition: recipientPosition,
                  recipientCompany: recipientCompany,
                  date: date,
                  generatedSubject: editableSubject,
                  generatedBody: editableBody,
                  writerName: user?.user_metadata?.full_name || user?.email || 'Unknown',
                  letter_number: currentLetter?.letter_number || undefined
                }}
                onLetterGenerated={handleLetterGenerated}
              />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WritingLetterPage;