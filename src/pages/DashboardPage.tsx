import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart, FileText, Calculator, FolderOpen, Users, User, LogOut, CheckSquare, Clock, AlertCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, X, MessageSquare, Edit, BookOpen, Mail, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskDetailOutcomeDialog } from '@/components/TaskDetailOutcomeDialog';
import { useLanguage } from '@/contexts/LanguageContext';
const DashboardPage = () => {
  const { language } = useLanguage();
  const langPrefix = language === 'en' ? '/en' : '';
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  // Task edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Search and filter states for tasks
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [sortColumn, setSortColumn] = useState('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Search and filter states for requests
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [requestPriorityFilter, setRequestPriorityFilter] = useState('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [requestSortColumn, setRequestSortColumn] = useState('created_at');
  const [requestSortDirection, setRequestSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const navigate = useNavigate();
  const { toast } = useToast();

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
      
      setUserRole(data?.role || 'general_user');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user?.id) {
      checkUserRole();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.email) {
      fetchMyTasks();
      if (userRole === 'admin') {
        fetchMyRequests();
      }
    }
  }, [user?.email, userRole]);

  const fetchMyTasks = async () => {
    setTasksLoading(true);
    try {
      // Fetch all tasks where user is involved (assigned_to, assigned_by, or confirm_by)
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id},confirm_by.eq.${user.id}`)
        .in('status', ['todo', 'in_progress'])
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch projects to map project names
      const projectIds = [...new Set(tasksData?.map(task => task.project_id).filter(Boolean) || [])];
      
      let projectsMap: Record<string, string> = {};
      if (projectIds.length > 0) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('adrian_projects')
          .select('project_id, project_name')
          .in('project_id', projectIds);

        if (projectsError) throw projectsError;

        // Map project names to tasks
        projectsMap = (projectsData || []).reduce((acc: Record<string, string>, project) => {
          acc[project.project_id || ''] = project.project_name;
          return acc;
        }, {});
      }

      const tasksWithProjects = (tasksData || []).map(task => ({
        ...task,
        project_name: projectsMap[task.project_id] || 'Unknown Project'
      }));

      setTasks(tasksWithProjects);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Failed to load your tasks.",
        variant: "destructive"
      });
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    try {
      // Fetch requests from the requests table
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .or(`user_id.eq.${user.id},request_to.eq.${user.id},confirm_by.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error loading requests",
        description: "Failed to load your requests.",
        variant: "destructive"
      });
    } finally {
      setRequestsLoading(false);
    }
  };

  // Categorize tasks by user role
  const tasksByRole = useMemo(() => {
    const assignedToMe = tasks.filter(task => task.assigned_to === user?.id);
    const tasksToConfirm = tasks.filter(task => task.confirm_by === user?.id && task.assigned_to !== user?.id);
    
    return { assignedToMe, tasksToConfirm };
  }, [tasks, user?.id]);

  // Filtering and sorting logic for tasks
  const getFilteredAndSortedTasks = (taskList: any[]) => {
    let filtered = taskList.filter(task => {
      // Search filter - use 'title' (actual column) with fallback to task_name
      const taskTitle = task.task_name || '';
      const searchMatch = searchTerm === '' || 
        taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.project_name && task.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Priority filter
      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
      
      // Status filter
      const statusMatch = statusFilter === 'all' || task.status === statusFilter;
      
      // Overdue filter
      const isOverdue = task.due_date && new Date(task.due_date) < new Date();
      const overdueMatch = !showOverdueOnly || isOverdue;
      
      return searchMatch && priorityMatch && statusMatch && overdueMatch;
    });

    // Sort the filtered tasks
    filtered.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Handle different data types
      if (sortColumn === 'due_date' || sortColumn === 'created_at') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue ? bValue.toLowerCase() : '';
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredAndSortedTasksByRole = useMemo(() => ({
    assignedToMe: getFilteredAndSortedTasks(tasksByRole.assignedToMe),
    tasksToConfirm: getFilteredAndSortedTasks(tasksByRole.tasksToConfirm)
  }), [tasksByRole, searchTerm, priorityFilter, statusFilter, showOverdueOnly, sortColumn, sortDirection]);

  // Categorize requests by user role
  const requestsByRole = useMemo(() => {
    const requestsByMe = requests.filter(request => request.user_id === user?.id);
    const requestsToMe = requests.filter(request => request.request_to === user?.id);
    const requestsToConfirm = requests.filter(request => request.confirm_by === user?.id && request.user_id !== user?.id && request.request_to !== user?.id);
    
    return { requestsByMe, requestsToMe, requestsToConfirm };
  }, [requests, user?.id]);

  // Filtering and sorting logic for requests
  const getFilteredAndSortedRequests = (requestList: any[]) => {
    let filtered = requestList.filter(request => {
      // Search filter
      const searchMatch = requestSearchTerm === '' || 
        request.request_by.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
        (request.description && request.description.toLowerCase().includes(requestSearchTerm.toLowerCase()));
      
      // Priority filter
      const priorityMatch = requestPriorityFilter === 'all' || request.priority === requestPriorityFilter;
      
      // Status filter
      const statusMatch = requestStatusFilter === 'all' || request.status === requestStatusFilter;
      
      return searchMatch && priorityMatch && statusMatch;
    });

    // Sort the filtered requests
    filtered.sort((a, b) => {
      let aValue = a[requestSortColumn];
      let bValue = b[requestSortColumn];
      
      // Handle different data types
      if (requestSortColumn === 'due_date' || requestSortColumn === 'created_at' || requestSortColumn === 'updated_at') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue ? bValue.toLowerCase() : '';
      }
      
      if (aValue < bValue) return requestSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return requestSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredAndSortedRequestsByRole = useMemo(() => ({
    requestsByMe: getFilteredAndSortedRequests(requestsByRole.requestsByMe),
    requestsToMe: getFilteredAndSortedRequests(requestsByRole.requestsToMe),
    requestsToConfirm: getFilteredAndSortedRequests(requestsByRole.requestsToConfirm)
  }), [requestsByRole, requestSearchTerm, requestPriorityFilter, requestStatusFilter, requestSortColumn, requestSortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRequestSort = (column: string) => {
    if (requestSortColumn === column) {
      setRequestSortDirection(requestSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setRequestSortColumn(column);
      setRequestSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setShowOverdueOnly(false);
  };

  const clearRequestFilters = () => {
    setRequestSearchTerm('');
    setRequestPriorityFilter('all');
    setRequestStatusFilter('all');
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getRequestSortIcon = (column: string) => {
    if (requestSortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    return requestSortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account."
    });
    navigate(langPrefix || '/');
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>;
  }
  // Filter dashboard items based on user role
  const dashboardItems = [{
    title: 'Projects',
    description: 'Manage your ongoing projects',
    icon: FolderOpen,
    path: '/projects',
    color: 'text-indigo-500',
    requiresAdmin: true
  }, {
    title: 'Financial Analysis',
    description: 'Analyze your financial data and reports',
    icon: Calculator,
    path: '/financial-analysis',
    color: 'text-green-500',
    requiresAdmin: true
  }, {
    title: 'HR Management',
    description: 'Manage employees, roles, and HR documents',
    icon: Users,
    path: '/hr-management',
    color: 'text-purple-500',
    requiresAdmin: true
  }, {
    title: 'Customers',
    description: 'Manage B2B customers and contacts',
    icon: Building2,
    path: '/customers',
    color: 'text-amber-500',
    requiresAdmin: true
  }, {
    title: 'Writing a Letter',
    description: 'Create and manage your business letters',
    icon: FileText,
    path: '/writing-letter',
    color: 'text-blue-500',
    requiresAdmin: true
  }, {
    title: 'Creating a Document',
    description: 'Advanced document creation tools',
    icon: FileText,
    path: '/create-document',
    color: 'text-orange-500',
    requiresAdmin: true
  }, {
    title: 'Create a Request',
    description: 'Submit requests to administrators',
    icon: MessageSquare,
    path: '/create-request',
    color: 'text-pink-500',
    requiresAdmin: false
  }, {
    title: 'Blog Dashboard',
    description: 'Create and manage blog posts with SEO',
    icon: BookOpen,
    path: '/dashboard/blog',
    color: 'text-cyan-500',
    requiresAdmin: false,
    requiresRole: true
  }, {
    title: 'Email',
    description: 'Send and manage your emails',
    icon: Mail,
    path: '/email',
    color: 'text-sky-500',
    requiresAdmin: false
  }, {
    title: 'Our Life',
    description: 'Personal finance, calendar and tasks',
    icon: BarChart,
    path: '/our-life',
    color: 'text-rose-500',
    requiresAdmin: false,
    specialAccess: ['r.sattari@adrianidea.ir', 'm.barkhordari@adrianidea.ir']
  }].filter(item => {
    if (item.requiresAdmin && userRole !== 'admin') return false;
    if (item.requiresRole && !userRole) return false;
    if (item.specialAccess && !item.specialAccess.includes(user?.email)) return false;
    return true;
  });
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" dir="ltr">
        <div className="max-w-6xl mx-auto text-left">
          {/* Welcome Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1 sm:mb-2 text-left">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground text-left">
                  Manage your business operations from your dashboard
                </p>
              </div>
              <div className="flex items-center gap-4">
                
                
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {dashboardItems.map(item => <Card key={item.path} className="glass hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 text-left min-h-[100px]" onClick={() => navigate(item.path)}>
                <CardHeader>
                  <div className="flex items-center justify-start gap-3">
                    <div className={`p-2 rounded-lg bg-accent/10`}>
                      <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
                    </div>
                    <CardTitle className="text-base sm:text-lg text-left">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-left">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>


          {/* My Tasks */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h2 className="text-xl sm:text-2xl font-display font-bold">My Tasks</h2>
            </div>

            {/* Search and Filter Controls */}
            <Card className="glass mb-4 sm:mb-6">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 min-h-[44px]"
                    />
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full sm:w-32 min-h-[44px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32 min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="overdue-only"
                        checked={showOverdueOnly}
                        onCheckedChange={setShowOverdueOnly}
                      />
                      <Label htmlFor="overdue-only" className="text-sm">Overdue only</Label>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2 min-h-[36px]"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {filteredAndSortedTasksByRole.assignedToMe.length + filteredAndSortedTasksByRole.tasksToConfirm.length} of {tasks.length} tasks
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Table - Organized by Role */}
            {tasksLoading ? (
              <Card className="glass">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : tasks.length === 0 ? (
              <Card className="glass">
                <CardContent className="text-center py-8 sm:py-12">
                  <CheckSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No pending tasks</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    You don't have any tasks at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Tasks Assigned To Me */}
                {filteredAndSortedTasksByRole.assignedToMe.length > 0 && (
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Tasks Assigned To Me ({filteredAndSortedTasksByRole.assignedToMe.length})</CardTitle>
                      <CardDescription className="text-sm">Tasks you need to work on</CardDescription>
                    </CardHeader>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="min-w-[700px] sm:min-w-0 px-4 sm:px-0">
                        <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task Name</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Assigned By</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedTasksByRole.assignedToMe.map(task => {
                            const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                            const priorityColors = { high: 'destructive', medium: 'secondary', low: 'outline' };
                            
                            return (
                              <TableRow key={task.id} className={`hover:bg-muted/50 transition-colors ${isOverdue ? 'bg-destructive/5' : ''}`}>
                                <TableCell className="font-medium">{task.task_name}</TableCell>
                                <TableCell>{task.project_name}</TableCell>
                                <TableCell>{task.assigned_by || <span className="text-muted-foreground">-</span>}</TableCell>
                                <TableCell>
                                  <Badge variant={priorityColors[task.priority]} className="text-xs">{task.priority}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'} className="text-xs">
                                    {task.status.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {task.due_date ? (
                                    <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                                      {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                      {new Date(task.due_date).toLocaleDateString()}
                                      {isOverdue && <span className="text-xs">(Overdue)</span>}
                                    </div>
                                  ) : <span className="text-muted-foreground">No due date</span>}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" onClick={() => { setSelectedTask(task); setEditDialogOpen(true); }} className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Tasks to Confirm */}
                {filteredAndSortedTasksByRole.tasksToConfirm.length > 0 && (
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Tasks to Confirm ({filteredAndSortedTasksByRole.tasksToConfirm.length})</CardTitle>
                      <CardDescription className="text-sm">Tasks awaiting your confirmation</CardDescription>
                    </CardHeader>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="min-w-[700px] sm:min-w-0 px-4 sm:px-0">
                        <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task Name</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedTasksByRole.tasksToConfirm.map(task => {
                            const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                            const priorityColors = { high: 'destructive', medium: 'secondary', low: 'outline' };
                            
                            return (
                              <TableRow key={task.id} className={`hover:bg-muted/50 transition-colors ${isOverdue ? 'bg-destructive/5' : ''}`}>
                                <TableCell className="font-medium">{task.task_name}</TableCell>
                                <TableCell>{task.project_name}</TableCell>
                                <TableCell>{task.assigned_to || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                                <TableCell>
                                  <Badge variant={priorityColors[task.priority]} className="text-xs">{task.priority}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'} className="text-xs">
                                    {task.status.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {task.due_date ? (
                                    <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                                      {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                      {new Date(task.due_date).toLocaleDateString()}
                                      {isOverdue && <span className="text-xs">(Overdue)</span>}
                                    </div>
                                  ) : <span className="text-muted-foreground">No due date</span>}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" onClick={() => { setSelectedTask(task); setEditDialogOpen(true); }} className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      </div>
                    </div>
                  </Card>
                )}

                {/* No tasks found message */}
                {(filteredAndSortedTasksByRole.assignedToMe.length === 0 && 
                  filteredAndSortedTasksByRole.tasksToConfirm.length === 0) && (
                  <Card className="glass">
                    <CardContent className="text-center py-8 sm:py-12">
                      <Search className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2">No tasks found</h3>
                      <p className="text-muted-foreground">
                        No tasks match your current search and filter criteria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* My Requests - Only for Admins */}
          {userRole === 'admin' && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-display font-bold">My Requests</h2>
              </div>

              {/* Request Search and Filter Controls */}
              <Card className="glass mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search requests or descriptions..."
                        value={requestSearchTerm}
                        onChange={(e) => setRequestSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select value={requestPriorityFilter} onValueChange={setRequestPriorityFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearRequestFilters}
                      className="flex items-center gap-2 w-fit"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      {filteredAndSortedRequestsByRole.requestsByMe.length + filteredAndSortedRequestsByRole.requestsToMe.length + filteredAndSortedRequestsByRole.requestsToConfirm.length} of {requests.length} requests
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requests Table - Organized by Role */}
              {requestsLoading ? (
                <Card className="glass">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-1/6" />
                          <Skeleton className="h-4 w-1/6" />
                          <Skeleton className="h-4 w-1/6" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : requests.length === 0 ? (
                <Card className="glass">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No requests</h3>
                    <p className="text-muted-foreground">
                      You don't have any requests at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Requests Created By Me */}
                  {filteredAndSortedRequestsByRole.requestsByMe.length > 0 && (
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-lg">Requests Created By Me ({filteredAndSortedRequestsByRole.requestsByMe.length})</CardTitle>
                        <CardDescription>Requests you have submitted</CardDescription>
                      </CardHeader>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Request By</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Created At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAndSortedRequestsByRole.requestsByMe.map(request => {
                              const isOverdue = request.due_date && new Date(request.due_date) < new Date();
                              const priorityColors = { high: 'destructive', medium: 'secondary', low: 'outline' };
                              const statusColors = { pending: 'secondary', in_progress: 'default', completed: 'outline', rejected: 'destructive' };
                              
                              return (
                                <TableRow key={request.id} className={`hover:bg-muted/50 transition-colors ${isOverdue ? 'bg-destructive/5' : ''}`}>
                                  <TableCell className="font-medium">{request.request_by}</TableCell>
                                  <TableCell className="max-w-xs">
                                    {request.description ? (
                                      <span className="text-sm line-clamp-2" title={request.description}>{request.description}</span>
                                    ) : <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={priorityColors[request.priority]} className="text-xs">{request.priority}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={statusColors[request.status]} className="text-xs">{request.status.replace('_', ' ')}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {request.due_date ? (
                                      <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                                        {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                        {new Date(request.due_date).toLocaleDateString()}
                                        {isOverdue && <span className="text-xs">(Overdue)</span>}
                                      </div>
                                    ) : <span className="text-muted-foreground">No due date</span>}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {new Date(request.created_at).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  )}

                  {/* Requests Assigned To Me */}
                  {filteredAndSortedRequestsByRole.requestsToMe.length > 0 && (
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-lg">Requests Assigned To Me ({filteredAndSortedRequestsByRole.requestsToMe.length})</CardTitle>
                        <CardDescription>Requests you need to handle</CardDescription>
                      </CardHeader>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Request By</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Created At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAndSortedRequestsByRole.requestsToMe.map(request => {
                              const isOverdue = request.due_date && new Date(request.due_date) < new Date();
                              const priorityColors = { high: 'destructive', medium: 'secondary', low: 'outline' };
                              const statusColors = { pending: 'secondary', in_progress: 'default', completed: 'outline', rejected: 'destructive' };
                              
                              return (
                                <TableRow key={request.id} className={`hover:bg-muted/50 transition-colors ${isOverdue ? 'bg-destructive/5' : ''}`}>
                                  <TableCell className="font-medium">{request.request_by}</TableCell>
                                  <TableCell className="max-w-xs">
                                    {request.description ? (
                                      <span className="text-sm line-clamp-2" title={request.description}>{request.description}</span>
                                    ) : <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={priorityColors[request.priority]} className="text-xs">{request.priority}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={statusColors[request.status]} className="text-xs">{request.status.replace('_', ' ')}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {request.due_date ? (
                                      <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                                        {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                        {new Date(request.due_date).toLocaleDateString()}
                                        {isOverdue && <span className="text-xs">(Overdue)</span>}
                                      </div>
                                    ) : <span className="text-muted-foreground">No due date</span>}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {new Date(request.created_at).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  )}

                  {/* Requests to Confirm */}
                  {filteredAndSortedRequestsByRole.requestsToConfirm.length > 0 && (
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-lg">Requests to Confirm ({filteredAndSortedRequestsByRole.requestsToConfirm.length})</CardTitle>
                        <CardDescription>Requests awaiting your confirmation</CardDescription>
                      </CardHeader>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Request By</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Created At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAndSortedRequestsByRole.requestsToConfirm.map(request => {
                              const isOverdue = request.due_date && new Date(request.due_date) < new Date();
                              const priorityColors = { high: 'destructive', medium: 'secondary', low: 'outline' };
                              const statusColors = { pending: 'secondary', in_progress: 'default', completed: 'outline', rejected: 'destructive' };
                              
                              return (
                                <TableRow key={request.id} className={`hover:bg-muted/50 transition-colors ${isOverdue ? 'bg-destructive/5' : ''}`}>
                                  <TableCell className="font-medium">{request.request_by}</TableCell>
                                  <TableCell className="max-w-xs">
                                    {request.description ? (
                                      <span className="text-sm line-clamp-2" title={request.description}>{request.description}</span>
                                    ) : <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={priorityColors[request.priority]} className="text-xs">{request.priority}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={statusColors[request.status]} className="text-xs">{request.status.replace('_', ' ')}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {request.due_date ? (
                                      <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                                        {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                        {new Date(request.due_date).toLocaleDateString()}
                                        {isOverdue && <span className="text-xs">(Overdue)</span>}
                                      </div>
                                    ) : <span className="text-muted-foreground">No due date</span>}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {new Date(request.created_at).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  )}

                  {/* No requests found message */}
                  {(filteredAndSortedRequestsByRole.requestsByMe.length === 0 && 
                    filteredAndSortedRequestsByRole.requestsToMe.length === 0 &&
                    filteredAndSortedRequestsByRole.requestsToConfirm.length === 0) && (
                    <Card className="glass">
                      <CardContent className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                        <p className="text-muted-foreground">
                          No requests match your current search and filter criteria.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Task Detail Outcome Dialog */}
      {selectedTask && (
        <TaskDetailOutcomeDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={selectedTask}
          onTaskUpdated={() => {
            fetchMyTasks();
            setSelectedTask(null);
          }}
        />
      )}
      
      <Footer />
    </div>;
};
export default DashboardPage;