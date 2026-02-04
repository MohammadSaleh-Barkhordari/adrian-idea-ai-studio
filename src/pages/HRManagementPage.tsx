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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  X, 
  Edit, 
  Trash2, 
  FileText,
  Download,
  Upload,
  ArrowLeft
} from 'lucide-react';
import EmployeeForm from '@/components/EmployeeForm';
import RoleManagement from '@/components/RoleManagement';

interface Employee {
  id: string;
  name: string;
  surname: string;
  job_title: string | null;
  job_type: string | null;
  employee_number: string | null;
  department: string | null;
  employment_type: string;
  hire_date: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  user_id: string | null;
}

const HRManagementPage = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const navigate = useNavigate();
  const { toast } = useToast();

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
    if (user) {
      checkUserRole();
    }
  }, [user]);

  useEffect(() => {
    if (user && userRole !== null) {
      fetchEmployees();
    }
  }, [user, userRole]);

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
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
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
          description: "You need admin privileges to access HR Management.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/dashboard');
    }
  };

  const fetchEmployees = async () => {
    if (!user) return;
    
    setEmployeesLoading(true);
    try {
      let query = supabase.from('employees').select('*');
      
      // If user is not admin, only fetch their own employee record
      if (userRole !== 'admin') {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.employee_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.job_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
      const matchesEmploymentType = employmentTypeFilter === 'all' || employee.employment_type === employmentTypeFilter;
      const matchesJobType = jobTypeFilter === 'all' || employee.job_type === jobTypeFilter;

      return matchesSearch && matchesDepartment && matchesEmploymentType && matchesJobType;
    });

    // Sort employees
    filtered.sort((a, b) => {
      let aValue = a[sortColumn as keyof Employee];
      let bValue = b[sortColumn as keyof Employee];
      
      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [employees, searchTerm, departmentFilter, employmentTypeFilter, jobTypeFilter, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setEmploymentTypeFilter('all');
    setJobTypeFilter('all');
  };

  const uniqueDepartments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

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
      
      <main className="container mx-auto px-6 pt-20 pb-8" dir="ltr">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-display font-bold">HR Management</h1>
                </div>
                <p className="text-muted-foreground">
                  Manage employees, roles, and HR documents
                </p>
              </div>
              {userRole === 'admin' && (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowRoleManagement(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Roles
                  </Button>
                  <Button onClick={() => setShowEmployeeForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{employees.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Employees</p>
                    <p className="text-2xl font-bold">
                      {employees.filter(emp => emp.employment_type === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Departments</p>
                    <p className="text-2xl font-bold">{uniqueDepartments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Admin Users</p>
                    <p className="text-2xl font-bold">
                      {employees.filter(emp => emp.job_type === 'admin').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employees Table */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Directory
              </CardTitle>
              <CardDescription>
                Manage employee information and contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {uniqueDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="general_user">General User</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm || departmentFilter !== 'all' || employmentTypeFilter !== 'all' || jobTypeFilter !== 'all') && (
                    <Button variant="outline" onClick={clearFilters} size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Table */}
              {employeesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredAndSortedEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No employees found</p>
                  <p className="text-muted-foreground mb-4">
                    {employees.length === 0 
                      ? "Start by adding your first employee"
                      : "Try adjusting your search filters"
                    }
                  </p>
                  {employees.length === 0 && (
                    <Button onClick={() => setShowEmployeeForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Employee
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto min-w-full">
                  <Table className="min-w-[1800px]">
                    <TableHeader>
                      <TableRow>
                        {/* Basic Information */}
                        <TableHead 
                          className="cursor-pointer select-none min-w-[100px]"
                          onClick={() => handleSort('employee_number')}
                        >
                          <div className="flex items-center gap-2">
                            Employee #
                            {getSortIcon('employee_number')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none min-w-[150px]"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Name
                            {getSortIcon('name')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none min-w-[120px]"
                          onClick={() => handleSort('job_title')}
                        >
                          <div className="flex items-center gap-2">
                            Job Title
                            {getSortIcon('job_title')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none min-w-[100px]"
                          onClick={() => handleSort('department')}
                        >
                          <div className="flex items-center gap-2">
                            Department
                            {getSortIcon('department')}
                          </div>
                        </TableHead>
                        
                        {/* Employment Details */}
                        <TableHead 
                          className="cursor-pointer select-none min-w-[100px]"
                          onClick={() => handleSort('employment_type')}
                        >
                          <div className="flex items-center gap-2">
                            Type
                            {getSortIcon('employment_type')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none min-w-[80px]"
                          onClick={() => handleSort('job_type')}
                        >
                          <div className="flex items-center gap-2">
                            Role
                            {getSortIcon('job_type')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none min-w-[100px]"
                          onClick={() => handleSort('start_date')}
                        >
                          <div className="flex items-center gap-2">
                            Start Date
                            {getSortIcon('start_date')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none min-w-[100px]"
                          onClick={() => handleSort('end_date')}
                        >
                          <div className="flex items-center gap-2">
                            End Date
                            {getSortIcon('end_date')}
                          </div>
                        </TableHead>
                        
                        {/* Contact Information */}
                        <TableHead className="min-w-[120px]">Phone</TableHead>
                        <TableHead className="min-w-[150px]">Personal Email</TableHead>
                        <TableHead className="min-w-[200px]">Address</TableHead>
                        
                        {/* Personal Details */}
                        <TableHead 
                          className="cursor-pointer select-none min-w-[100px]"
                          onClick={() => handleSort('date_of_birth')}
                        >
                          <div className="flex items-center gap-2">
                            Date of Birth
                            {getSortIcon('date_of_birth')}
                          </div>
                        </TableHead>
                        
                        {/* Financial Information */}
                        <TableHead 
                          className="cursor-pointer select-none min-w-[100px]"
                          onClick={() => handleSort('salary')}
                        >
                          <div className="flex items-center gap-2">
                            Salary
                            {getSortIcon('salary')}
                          </div>
                        </TableHead>
                        <TableHead className="min-w-[100px]">Pay Frequency</TableHead>
                        <TableHead className="min-w-[150px]">Bank Details</TableHead>
                        
                        {/* Documents */}
                        <TableHead className="min-w-[120px]">Contract ID</TableHead>
                        
                        <TableHead className="min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          {/* Basic Information */}
                          <TableCell className="font-medium">
                            {employee.employee_number}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {employee.name} {employee.surname}
                              </div>
                              {employee.email && (
                                <div className="text-sm text-muted-foreground">
                                  {employee.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{employee.job_title || '-'}</TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          
                          {/* Employment Details */}
                          <TableCell>
                            <Badge variant="outline">
                              {employee.employment_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={employee.job_type === 'admin' ? 'default' : 'secondary'}>
                              {employee.job_type === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {employee.employment_type === 'active' ? (
                              <Badge variant="outline" className="text-green-600">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-destructive">
                                {employee.employment_type}
                              </Badge>
                            )}
                          </TableCell>
                          
                          {/* Contact Information - Redacted for security */}
                          <TableCell>
                            <Badge variant="secondary">Protected</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Protected</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Protected</Badge>
                          </TableCell>
                          
                          {/* Personal Details - Redacted */}
                          <TableCell>
                            <Badge variant="secondary">Protected</Badge>
                          </TableCell>
                          
                          {/* Financial Information - Redacted */}
                          <TableCell>
                            <Badge variant="secondary">Protected</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Protected</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Protected</Badge>
                          </TableCell>
                          
                          {/* Documents - Redacted */}
                          <TableCell>
                            <Badge variant="secondary">Protected</Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {userRole === 'admin' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingEmployee(employee);
                                      setShowEmployeeForm(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteEmployee(employee.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {userRole !== 'admin' && employees.length > 0 && (
                                <span className="text-sm text-muted-foreground">View Only</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Employee Form Dialog */}
      <Dialog open={showEmployeeForm} onOpenChange={(open) => {
        setShowEmployeeForm(open);
        if (!open) {
          setEditingEmployee(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee ? 'Update employee information' : 'Enter the new employee details'}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(null);
              fetchEmployees();
            }}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={showRoleManagement} onOpenChange={setShowRoleManagement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Role Management</DialogTitle>
            <DialogDescription>
              Assign roles to users
            </DialogDescription>
          </DialogHeader>
          <RoleManagement />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRManagementPage;