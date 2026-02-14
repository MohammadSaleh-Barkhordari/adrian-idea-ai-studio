import { useState, useEffect, useCallback } from 'react';
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

interface CrmCustomer {
  id: string;
  company_name: string;
  company_name_fa: string | null;
  customer_status: string;
}

interface CrmContact {
  id: string;
  first_name: string;
  last_name: string;
  first_name_fa: string | null;
  last_name_fa: string | null;
  honorific_fa: string | null;
  title_fa: string | null;
  job_title: string | null;
  job_title_fa: string | null;
  is_primary_contact: boolean | null;
  email: string | null;
}

const WritingLetterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [writerNameFa, setWriterNameFa] = useState<string>('');
  const [writerJobTitleFa, setWriterJobTitleFa] = useState<string>('');
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

  // CRM state
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [crmAutoFilled, setCrmAutoFilled] = useState<{
    recipientName?: boolean;
    recipientPosition?: boolean;
    recipientCompany?: boolean;
  }>({});

  const { toast } = useToast();

  // ---- Data fetching ----

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, company_name, company_name_fa, customer_status')
        .order('company_name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchContacts = async (customerId: string) => {
    if (!customerId) { setContacts([]); return; }
    try {
      const { data, error } = await supabase
        .from('customer_contacts')
        .select('id, first_name, last_name, first_name_fa, last_name_fa, honorific_fa, title_fa, job_title, job_title_fa, is_primary_contact, email')
        .eq('customer_id', customerId)
        .eq('is_active', true)
        .order('is_primary_contact', { ascending: false });
      if (error) throw error;
      setContacts(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
      return [];
    }
  };

  const fetchProjects = useCallback(async (customerId?: string) => {
    try {
      let query = supabase
        .from('adrian_projects')
        .select('project_id, project_name, customer_id')
        .order('created_at', { ascending: false });

      // If a customer is selected, show their projects + unlinked projects
      // We'll filter client-side for the OR condition
      const { data, error } = await query;
      if (error) throw error;

      if (customerId) {
        const filtered = (data || []).filter(
          p => p.customer_id === customerId || !p.customer_id
        );
        setProjects(filtered);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchDocuments = async (projectId: string) => {
    if (!projectId) { setDocuments([]); return; }
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

  // ---- CRM handlers ----

  const handleCustomerChange = async (customerId: string) => {
    setSelectedCustomer(customerId);
    setSelectedContact('');

    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setRecipientCompany(customer.company_name_fa || customer.company_name);
      setCrmAutoFilled(prev => ({ ...prev, recipientCompany: true }));
    }

    // Fetch contacts and auto-select primary
    const contactList = await fetchContacts(customerId);
    if (contactList && contactList.length > 0) {
      const primary = contactList.find(c => c.is_primary_contact);
      if (primary) {
        applyContact(primary);
      }
    }

    // Re-fetch projects filtered by customer
    await fetchProjects(customerId);
  };

  const applyContact = (contact: CrmContact) => {
    setSelectedContact(contact.id);
    // Persian-first recipient name: honorific_fa + title_fa + last_name_fa
    if (contact.last_name_fa) {
      const parts = [contact.honorific_fa, contact.title_fa, contact.last_name_fa].filter(Boolean);
      setRecipientName(parts.join(' '));
    } else {
      setRecipientName(`${contact.first_name} ${contact.last_name}`);
    }
    // Persian-first position
    setRecipientPosition(contact.job_title_fa || contact.job_title || '');
    setCrmAutoFilled(prev => ({
      ...prev,
      recipientName: true,
      recipientPosition: true,
    }));
    setContactEmail(contact.email || '');
  };

  const handleContactChange = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      applyContact(contact);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedDocument('');
    fetchDocuments(projectId);
  };

  // ---- Voice extracted fields with CRM matching ----

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

    // Try to match company name against CRM customers
    if (fields.recipientCompany && customers.length > 0) {
      const match = customers.find(c =>
        c.company_name.toLowerCase().includes(fields.recipientCompany.toLowerCase()) ||
        fields.recipientCompany.toLowerCase().includes(c.company_name.toLowerCase())
      );
      if (match) {
        await handleCustomerChange(match.id);
        // Try to match contact name
        if (fields.recipientName) {
          const contactMatch = contacts.find(c =>
            `${c.first_name} ${c.last_name}`.toLowerCase().includes(fields.recipientName.toLowerCase())
          );
          if (contactMatch) {
            applyContact(contactMatch);
          }
        }
      }
    }

    // Create letter record with extracted fields
    if (user) {
      const { data: letterData, error } = await supabase
        .from('letters')
        .insert({
          user_id: user.id,
          project_id: selectedProject || null,
          document_id: selectedDocument || null,
          recipient_name: fields.recipientName,
          recipient_position: fields.recipientPosition,
          recipient_company: fields.recipientCompany,
          user_request: fields.userRequest,
          status: 'fields_extracted',
          customer_id: selectedCustomer || null,
          customer_contact_id: selectedContact || null,
          has_attachment: false,
          needs_signature: false,
          needs_stamp: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating letter:', error);
      } else if (letterData) {
        setGeneratedLetter({
          subject_line: letterData.generated_subject || '',
          body: letterData.generated_body || '',
          date: letterData.created_at.split('T')[0],
          recipient_name: letterData.recipient_name || '',
          recipient_position: letterData.recipient_position || '',
          recipient_company: letterData.recipient_company || ''
        });
      }
    }
  };

  // ---- Auth & role ----

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
      if (role !== 'admin') {
        toast({ title: "Access Denied", description: "You don't have permission to access this page.", variant: "destructive" });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/dashboard');
    }
  };

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      // Fetch Persian name and job title for the current user
      const { data: empData } = await supabase
        .from('employees')
        .select('name_fa, surname_fa, job_title_fa')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (empData) {
        const nameParts = [empData.name_fa, empData.surname_fa].filter(Boolean);
        setWriterNameFa(nameParts.join(' '));
        setWriterJobTitleFa(empData.job_title_fa || '');
      }
      await Promise.all([fetchProjects(), fetchCustomers()]);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  // ---- Pre-fill from project page ----

  const prefillFromProject = async (projectId: string) => {
    setSelectedProject(projectId);
    try {
      const { data: project } = await supabase
        .from('adrian_projects')
        .select('customer_id, client_contact_id, client_name, client_company')
        .eq('project_id', projectId)
        .single();

      if (!project) return;

      if (project.customer_id) {
        // Auto-select customer and cascade
        setSelectedCustomer(project.customer_id);
        const customer = customers.find(c => c.id === project.customer_id);
        if (customer) {
          setRecipientCompany(customer.company_name_fa || customer.company_name);
          setCrmAutoFilled(prev => ({ ...prev, recipientCompany: true }));
        } else {
          const { data: custData } = await supabase
            .from('customers')
            .select('id, company_name, company_name_fa, customer_status')
            .eq('id', project.customer_id)
            .single();
          if (custData) {
            setRecipientCompany(custData.company_name_fa || custData.company_name);
            setCrmAutoFilled(prev => ({ ...prev, recipientCompany: true }));
          }
        }

        // Load contacts for this customer
        const contactList = await fetchContacts(project.customer_id);

        if (project.client_contact_id && contactList) {
          const contact = contactList.find(c => c.id === project.client_contact_id);
          if (contact) {
            applyContact(contact);
          }
        } else if (contactList && contactList.length > 0) {
          const primary = contactList.find(c => c.is_primary_contact);
          if (primary) applyContact(primary);
        }

        // Filter projects by this customer
        await fetchProjects(project.customer_id);
        setSelectedProject(projectId); // re-set after projects refresh
      } else {
        // Legacy project — fill text fields if available
        if (project.client_name) setRecipientName(project.client_name);
        if (project.client_company) setRecipientCompany(project.client_company);
      }
    } catch (error) {
      console.error('Error pre-filling from project:', error);
    }
  };

  // ---- Effects ----

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/auth');
        } else {
          setUser(session.user);
          fetchProjects();
          fetchCustomers();
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Pre-fill from project after initial data loads
  useEffect(() => {
    if (!loading && location.state?.selectedProjectId && user) {
      prefillFromProject(location.state.selectedProjectId);
    }
  }, [loading, user]);

  useEffect(() => {
    if (user) checkUserRole();
  }, [user]);

  useEffect(() => {
    if (selectedProject) fetchDocuments(selectedProject);
  }, [selectedProject]);

  // ---- Letter generation ----

  const handleAILetterGeneration = async () => {
    if (!recipientName.trim() || !userRequest.trim()) {
      toast({ title: "اطلاعات ناقص", description: "لطفاً نام گیرنده و درخواست کاربر را پر کنید.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
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
          customer_id: selectedCustomer || null,
          customer_contact_id: selectedContact || null,
          has_attachment: false,
          needs_signature: false,
          needs_stamp: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: generateData, error: generateError } = await supabase.functions.invoke('generate-letter', {
        body: {
          letterId: letterData.id,
          recipientName, recipientPosition, recipientCompany,
          userRequest,
          projectId: selectedProject || null,
          documentId: selectedDocument || null,
          userId: user.id,
        }
      });

      if (generateError) throw generateError;
      if (!generateData.success) throw new Error(generateData.error || 'Failed to generate letter');

      setGeneratedLetter({
        subject_line: generateData.subject_line,
        body: generateData.body,
        date, recipient_name: recipientName,
        recipient_position: recipientPosition,
        recipient_company: recipientCompany,
      });
      setEditableSubject(generateData.subject_line);
      setEditableBody(generateData.body);
      setCurrentLetter({ ...letterData, status: 'letter_generated' });

      toast({ title: "نامه تولید شد", description: "نامه شما با موفقیت تولید شد." });
    } catch (error) {
      console.error('Error generating letter:', error);
      toast({ title: "خطا", description: "خطا در تولید نامه. لطفاً دوباره تلاش کنید.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedToComposition = async () => {
    try {
      if (currentLetter?.id) {
        await supabase.from('letters').update({ status: 'preview_generated' }).eq('id', currentLetter.id);
        setCurrentLetter((prev: any) => ({ ...prev, status: 'preview_generated' }));
      }
      setShowLetterBuilder(true);
    } catch (error) {
      console.error('Error updating letter status:', error);
      setShowLetterBuilder(true);
    }
  };

  const handleLetterGenerated = () => {
    toast({ title: "نامه تولید شد", description: "نامه شما با موفقیت دانلود شد." });
  };

  const resetForm = () => {
    setRecipientName(''); setRecipientPosition(''); setRecipientCompany('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedProject(''); setSelectedDocument(''); setUserRequest('');
    setGeneratedLetter(null); setEditableSubject(''); setEditableBody('');
    setCurrentLetter(null); setShowLetterBuilder(false);
    setSelectedCustomer(''); setSelectedContact('');
    setCrmAutoFilled({});
    setContacts([]);
    fetchProjects();
  };

  // ---- Status badge helper ----
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      prospect: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[status] || colors.inactive;
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

      <main className="container mx-auto px-6 py-20" dir="ltr">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-accent" />
              Writing a Letter
            </h1>
            <p className="text-muted-foreground">Create professional business letters with ease</p>
          </div>

          <div className="mb-6">
            <VoiceRecorder onFieldsExtracted={handleFieldsExtracted} />
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Compose New Letter</CardTitle>
              <CardDescription>Fill in the details below to create your letter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Row 1: Customer | Client Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            {c.company_name}{c.company_name_fa ? ` — ${c.company_name_fa}` : ''}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusBadge(c.customer_status)}`}>
                              {c.customer_status}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Client Contact</Label>
                  <Select
                    value={selectedContact}
                    onValueChange={handleContactChange}
                    disabled={!selectedCustomer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCustomer ? "Select a contact" : "Select customer first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((c) => {
                        const faName = [c.first_name_fa, c.last_name_fa].filter(Boolean).join(' ');
                        const parts = [`${c.first_name} ${c.last_name}`];
                        if (faName) parts.push(faName);
                        if (c.job_title_fa) parts.push(c.job_title_fa);
                        else if (c.job_title) parts.push(c.job_title);
                        return (
                          <SelectItem key={c.id} value={c.id}>
                            {parts.join(' — ')}{c.is_primary_contact ? ' ★' : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Recipient Name | Recipient Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                   <Input
                    id="recipientName"
                    dir="rtl"
                    className="text-right"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                    placeholder="نام گیرنده..."
                    value={recipientName}
                    onChange={(e) => { setRecipientName(e.target.value); setCrmAutoFilled(prev => ({ ...prev, recipientName: false })); }}
                  />
                  {crmAutoFilled.recipientName && (
                    <p className="text-xs text-muted-foreground">from CRM</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPosition">Recipient Position</Label>
                   <Input
                    id="recipientPosition"
                    dir="rtl"
                    className="text-right"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                    placeholder="سمت گیرنده..."
                    value={recipientPosition}
                    onChange={(e) => { setRecipientPosition(e.target.value); setCrmAutoFilled(prev => ({ ...prev, recipientPosition: false })); }}
                  />
                  {crmAutoFilled.recipientPosition && (
                    <p className="text-xs text-muted-foreground">from CRM</p>
                  )}
                </div>
              </div>

              {/* Row 3: Recipient Company | Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientCompany">Recipient Company</Label>
                   <Input
                    id="recipientCompany"
                    dir="rtl"
                    className="text-right"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                    placeholder="نام شرکت..."
                    value={recipientCompany}
                    onChange={(e) => { setRecipientCompany(e.target.value); setCrmAutoFilled(prev => ({ ...prev, recipientCompany: false })); }}
                  />
                  {crmAutoFilled.recipientCompany && (
                    <p className="text-xs text-muted-foreground">from CRM</p>
                  )}
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

              {/* Row 4: Project | Document */}
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

              {/* User Request */}
              <div className="space-y-2">
                <Label htmlFor="userRequest">User Request *</Label>
                 <Textarea
                  id="userRequest"
                  dir="rtl"
                  placeholder="Write your request and reason for the letter here..."
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  className="min-h-[200px] resize-none text-right"
                  style={{ direction: 'rtl', textAlign: 'right' }}
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
                <CardDescription>Review and edit the generated subject and body before creating the final letter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="editableSubject">Subject</Label>
                  <Input id="editableSubject" value={editableSubject} onChange={(e) => setEditableSubject(e.target.value)} placeholder="Letter subject..." className="text-right" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editableBody">Body</Label>
                  <Textarea id="editableBody" value={editableBody} onChange={(e) => setEditableBody(e.target.value)} placeholder="Letter body content..." className="min-h-[200px] resize-none text-right" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }} />
                </div>
                <div className="composition-section border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Create Final Letter</h3>
                  <p className="text-muted-foreground mb-4">Proceed to the drag-and-drop composition mode to position your letter elements and generate the final image.</p>
                  <div className="flex justify-center">
                    <Button onClick={handleProceedToComposition} className="flex items-center gap-2 bg-gradient-accent px-8" size="lg">
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
                  recipientName, recipientPosition, recipientCompany,
                  date,
                  generatedSubject: editableSubject,
                  generatedBody: editableBody,
                  writerName: user?.user_metadata?.full_name || user?.email || 'Unknown',
                  writerNameFa,
                  writerJobTitleFa,
                  contactEmail,
                  letter_number: currentLetter?.letter_number || undefined,
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
