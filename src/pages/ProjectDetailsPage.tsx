import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { NewDocumentDialog } from '@/components/NewDocumentDialog';
import { NewLetterDialog } from '@/components/NewLetterDialog';
import { NewTaskDialog } from '@/components/NewTaskDialog';
import { NewFileDialog } from '@/components/NewFileDialog';
import { ProjectEditDialog } from '@/components/ProjectEditDialog';
import GanttChart from '@/components/GanttChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Building, User, FileText, Clock, Plus, Edit3, Download, CheckSquare, File, Pencil, Trash2 } from 'lucide-react';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
  id: string;
  project_id: string;
  project_name: string;
  client_name?: string;
  client_company?: string;
  customer_id?: string;
  client_contact_id?: string;
  description?: string;
  status: string;
  priority: string;
  budget?: number;
  progress?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

interface Document {
  id: string;
  title?: string;
  summary?: string;
  file_url?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_by?: string;
  project_id: string;
  created_at: string;
}

interface Letter {
  id: string;
  letter_title?: string;
  letter_number?: string;
  recipient_name?: string;
  recipient_position?: string;
  recipient_company?: string;
  generated_subject?: string;
  generated_body?: string;
  user_request?: string;
  writer_name?: string;
  file_url?: string;
  final_image_url?: string;
  mime_type?: string;
  status: string;
  has_attachment?: boolean;
  project_id?: string;
  document_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  created_by?: string;
  due_date?: string;
  start_time?: string;
  priority: string;
  status: string;
  project_id: string;
  related_task_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectFile {
  id: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  description?: string;
  uploaded_by?: string;
  user_id?: string;
  project_id: string;
  created_at: string;
}

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [linkedCustomer, setLinkedCustomer] = useState<{ id: string; company_name: string } | null>(null);
  const [linkedContact, setLinkedContact] = useState<{ first_name: string; last_name: string; job_title: string | null } | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskEditDialogOpen, setTaskEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      if (projectId) {
        await checkUserRole(session.user.id);
        loadProjectData(projectId, session.user.id);
      }
    });

    checkUser();
    return () => subscription.unsubscribe();
  }, [projectId, navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
    if (projectId) {
      await checkUserRole(session.user.id);
      loadProjectData(projectId, session.user.id);
    }
  };

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        navigate('/dashboard');
        return;
      }
      
      const role = data?.role || 'general_user';
      setUserRole(role);
      
      // Redirect non-admin users to dashboard
      if (role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access Project Details.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/dashboard');
    }
  };

  const loadProjectData = async (id: string, userId: string) => {
    try {
      setLoading(true);

      // Load project details
      const { data: projectData, error: projectError } = await supabase
        .from('adrian_projects')
        .select('*')
        .eq('project_id', id)
        .single();

      if (projectError) {
        console.error('Error loading project:', projectError);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
        navigate('/projects');
        return;
      }

      setProject(projectData);

      // Fetch linked customer and contact
      if (projectData.customer_id) {
        const { data: custData } = await supabase.from('customers').select('id, company_name').eq('id', projectData.customer_id).single();
        setLinkedCustomer(custData || null);
      } else {
        setLinkedCustomer(null);
      }
      if (projectData.client_contact_id) {
        const { data: contactData } = await supabase.from('customer_contacts').select('first_name, last_name, job_title').eq('id', projectData.client_contact_id).single();
        setLinkedContact(contactData || null);
      } else {
        setLinkedContact(null);
      }
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (documentsError) {
        console.error('Error loading documents:', documentsError);
      } else {
        setDocuments(documentsData || []);
      }

      // Load all letters for this project
      const { data: lettersData, error: lettersError } = await supabase
        .from('letters')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (lettersError) {
        console.error('Error loading letters:', lettersError);
      } else {
        setLetters(lettersData || []);
      }

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
      } else {
        setTasks(tasksData || []);
      }

      // Load files
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (filesError) {
        console.error('Error loading files:', filesError);
      } else {
        setFiles(filesData || []);
      }

    } catch (error) {
      console.error('Error in loadProjectData:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentCreated = () => {
    if (projectId && user?.id) {
      loadProjectData(projectId, user.id);
    }
  };

  const handleFileCreated = () => {
    if (projectId && user?.id) {
      loadProjectData(projectId, user.id);
    }
  };

  const handleTaskCreated = () => {
    if (projectId && user?.id) {
      loadProjectData(projectId, user.id);
    }
  };

  const handleProjectUpdated = () => {
    if (projectId && user?.id) {
      loadProjectData(projectId, user.id);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id);
      
      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'todo': 
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Project Not Found</h1>
            <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/projects')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-8" dir="ltr">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/projects')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </div>

        <div className="space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{project.project_name}</CardTitle>
                  <p className="text-muted-foreground mt-1">Project ID: {project.project_id}</p>
                </div>
                <div className="flex gap-2 items-start">
                  <Badge className={getStatusColor(project.status)}>
                    {formatStatus(project.status)}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                    className="ml-2"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                {(linkedContact || project.client_name) && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Client:</span>
                    <span>{linkedContact ? `${linkedContact.first_name} ${linkedContact.last_name}${linkedContact.job_title ? ` — ${linkedContact.job_title}` : ''}` : project.client_name}</span>
                  </div>
                )}
                
                {(linkedCustomer || project.client_company) && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">Company:</span>
                    {linkedCustomer ? (
                      <Link to={`/customers/${linkedCustomer.id}`} className="text-primary hover:underline">{linkedCustomer.company_name}</Link>
                    ) : (
                      <span>{project.client_company}</span>
                    )}
                  </div>
                )}
                
                {project.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">Budget:</span>
                    <span>${project.budget.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(project.created_at)}</span>
                </div>
                
                {project.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Start Date:</span>
                    <span>{formatDate(project.start_date)}</span>
                  </div>
                )}
                
                {project.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">End Date:</span>
                    <span>{formatDate(project.end_date)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <GanttChart tasks={tasks} />

          {/* Top Row: Tasks and Letters */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">

          {/* Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Tasks ({tasks.length})
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setTaskDialogOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tasks found for this project</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className={getTaskStatusColor(task.status)}>
                              {formatStatus(task.status)}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </div>
                          
                          {task.assigned_to && (
                            <div className="space-y-1 text-sm text-muted-foreground mb-2">
                              <p><span className="font-medium">Assigned to:</span> {task.assigned_to}</p>
                            </div>
                          )}
                          
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Due:</span>
                              <span>{formatDate(task.due_date)}</span>
                            </div>
                          )}
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              <span className="font-medium">Description:</span> {task.description}
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Created: {formatDate(task.created_at)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTask(task);
                              setTaskEditDialogOpen(true);
                            }}
                            title="Edit task"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setTaskToDelete(task);
                              setDeleteConfirmOpen(true);
                            }}
                            title="Delete task"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Letters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Letters ({letters.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLetterDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Letter
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/writing-letter', { state: { selectedProjectId: project?.project_id } })}
                    className="flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Write Letter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {letters.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No letters found for this project</p>
              ) : (
                <div className="space-y-3">
                  {letters.map((letter) => (
                    <div key={letter.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {letter.letter_title || letter.generated_subject || `To: ${letter.recipient_name || 'Unknown'}`}
                          </h4>
                          {letter.letter_number && (
                            <span className="text-xs text-muted-foreground">#{letter.letter_number}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {formatStatus(letter.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(letter.created_at)}
                          </span>
                          {(letter.final_image_url || letter.file_url) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const downloadPath = letter.final_image_url || letter.file_url!;
                                  const { data, error } = await supabase.storage
                                    .from('Letters')
                                    .download(downloadPath);
                                  
                                  if (error) throw error;
                                  
                                  const url = URL.createObjectURL(data);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `letter-${letter.letter_number || letter.id}.png`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Download error:', error);
                                  toast({
                                    title: "Error",
                                    description: "Failed to download file",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="flex items-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {letter.recipient_name && (
                          <p>To: {letter.recipient_name}{letter.recipient_company ? ` — ${letter.recipient_company}` : ''}</p>
                        )}
                        {letter.writer_name && (
                          <p>From: {letter.writer_name}</p>
                        )}
                        {letter.generated_subject && (
                          <p><span className="font-medium">Subject:</span> {letter.generated_subject}</p>
                        )}
                        {letter.user_request && (
                          <p className="text-xs mt-1">Request: {letter.user_request}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Bottom Row: Documents and Files */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents ({documents.length})
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setDocumentDialogOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No documents found for this project</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {doc.title}
                          </h4>
                          
                          {doc.file_url ? (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-muted-foreground">
                                File: {doc.file_name}
                              </p>
                            {doc.file_size && (
                                <p className="text-xs text-muted-foreground">
                                  Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          ) : (
                            doc.summary && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {doc.summary}
                              </p>
                            )
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {formatDate(doc.created_at)}
                          </p>
                        </div>
                        
                        {doc.file_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.storage
                                  .from('documents')
                                  .download(doc.file_url);
                                
                                if (error) throw error;
                                
                                const url = URL.createObjectURL(data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = doc.file_name || 'document';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Download error:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to download file",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <File className="w-5 h-5" />
                  Files ({files.length})
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setFileDialogOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add File
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No files found for this project</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2">
                            <File className="w-4 h-4" />
                            {file.file_name}
                          </h4>
                          
                          {file.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {file.description}
                            </p>
                          )}
                          
                          <div className="mt-2 space-y-1">
                            {file.file_type && (
                              <p className="text-xs text-muted-foreground">
                                Type: {file.file_type}
                              </p>
                            )}
                            {file.file_size && (
                              <p className="text-xs text-muted-foreground">
                                Size: {(file.file_size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {formatDate(file.created_at)}
                          </p>
                        </div>
                        
                        {file.file_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.storage
                                  .from('Files')
                                  .download(file.file_url!);
                                
                                if (error) throw error;
                                
                                const url = URL.createObjectURL(data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = file.file_name || 'file';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Download error:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to download file",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <NewDocumentDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        projectId={projectId!}
        onDocumentCreated={handleDocumentCreated}
      />
      
      <NewLetterDialog
        open={letterDialogOpen}
        onOpenChange={setLetterDialogOpen}
        projectId={projectId!}
        onLetterCreated={handleDocumentCreated}
      />
      
      <NewTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        projectId={projectId!}
        onTaskCreated={handleTaskCreated}
      />
      
      <NewFileDialog
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        projectId={projectId!}
        onFileCreated={handleFileCreated}
      />
      
      <ProjectEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={project}
        onProjectUpdated={handleProjectUpdated}
      />
      
      {selectedTask && (
        <TaskEditDialog
          open={taskEditDialogOpen}
          onOpenChange={setTaskEditDialogOpen}
          task={selectedTask}
          userRole={userRole || 'general_user'}
          onTaskUpdated={() => {
            if (projectId && user) {
              loadProjectData(projectId, user.id);
            }
            setSelectedTask(null);
          }}
        />
      )}
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? 
              This action cannot be undone and will permanently remove the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetailsPage;