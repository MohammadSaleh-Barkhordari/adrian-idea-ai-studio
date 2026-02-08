import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, FolderOpen, Plus, Calendar, DollarSign, User, Filter, SortAsc, SortDesc, Search, X } from 'lucide-react';
import { NewProjectDialog } from '@/components/NewProjectDialog';
import { useToast } from '@/hooks/use-toast';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sort states
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/auth');
        } else {
          setUser(session.user);
          await checkUserRole(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      await checkUserRole(session.user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
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
        return false;
      }
      
      const role = data?.role || 'general_user';
      setUserRole(role);
      
      // Check the fetched role, not the state variable
      if (role !== 'admin') {
        toast({
          title: "Access Denied", 
          description: "You need admin privileges to access Projects.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return false;
      }
      
      // Only load projects if user is admin
      await loadProjects(userId);
      return true;
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/dashboard');
      return false;
    }
  };

  const loadProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('adrian_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        toast({
          title: "Error loading projects",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleProjectCreated = () => {
    if (user) {
      loadProjects(user.id);
    }
  };

  // Filter and sort logic
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(p => p.priority === priorityFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.project_name?.toLowerCase().includes(query) ||
        p.client_name?.toLowerCase().includes(query) ||
        p.project_id?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aVal: any = a[sortField as keyof typeof a];
      let bVal: any = b[sortField as keyof typeof b];
      
      // Handle null values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      // Handle date/string comparison
      if (sortField.includes('date') || sortField === 'created_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sortField === 'budget') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return result;
  }, [projects, statusFilter, priorityFilter, searchQuery, sortField, sortDirection]);

  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    setSortField('created_at');
    setSortDirection('desc');
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim() !== '';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500/10 text-blue-500';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'on_hold':
        return 'bg-orange-500/10 text-orange-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'low':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-accent" />
                Projects
              </h1>
              <p className="text-muted-foreground">
                Manage and track your ongoing projects
              </p>
            </div>
            <Button className="bg-gradient-accent" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Filter and Sort Controls */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name, client, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filter and Sort Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Field */}
              <div className="flex items-center gap-2 ml-auto">
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="project_name">Project Name</SelectItem>
                    <SelectItem value="client_name">Client Name</SelectItem>
                    <SelectItem value="start_date">Start Date</SelectItem>
                    <SelectItem value="end_date">End Date</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Direction Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedProjects.length} of {projects.length} projects
            </div>
          </div>

          {projects.length === 0 ? (
            <Card className="glass">
              <CardContent className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't created any projects yet. Start by creating your first project.
                </p>
                <Button className="bg-gradient-accent" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : filteredAndSortedProjects.length === 0 ? (
            <Card className="glass">
              <CardContent className="text-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Matching Projects</h3>
                <p className="text-muted-foreground mb-6">
                  No projects match your current filters. Try adjusting your search or filters.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProjects.map((project) => (
                <Card key={project.project_id} className="glass hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{project.project_name}</CardTitle>
                        <CardDescription className="text-sm">
                          {project.project_id} • {project.client_name}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(project.status)}>
                          {formatStatus(project.status)}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {project.project_manager && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{project.project_manager}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.budget && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Budget: ${project.budget.toLocaleString()}</span>
                          {project.actual_cost > 0 && (
                            <span className="text-muted-foreground">
                              (Spent: ${project.actual_cost.toLocaleString()})
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Created: {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {project.start_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Start: {new Date(project.start_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {project.end_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            End: {new Date(project.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="pt-3">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate(`/projects/${project.project_id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      <NewProjectDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onProjectCreated={handleProjectCreated} 
      />
    </div>
  );
};

export default ProjectsPage;
