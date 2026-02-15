import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calculator, Upload, Mic, Edit, Search, Filter, Download, ChevronUp, ChevronDown, Trash2, EditIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FinancialFileUpload from '@/components/FinancialFileUpload';
import FinancialVoiceRecorder from '@/components/FinancialVoiceRecorder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface FinancialData {
  from_entity: string;
  to_entity: string;
  amount: number;
  currency: string;
  transaction_type: 'income' | 'expense' | 'investment';
  description: string;
  transaction_date: string;
}

interface Project {
  project_id: string;
  project_name: string;
}

const FinancialAnalysisPage = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [financialRecords, setFinancialRecords] = useState<any[]>([]);
  
  // Form fields
  const [fromEntity, setFromEntity] = useState('');
  const [toEntity, setToEntity] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState('');
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    file: File;
    fileName: string;
    fileType: string;
  } | null>(null);
  
  // Table functionality states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterFromDate, setFilterFromDate] = useState<string>('');
  const [filterToDate, setFilterToDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const navigate = useNavigate();
  const { toast } = useToast();

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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/auth');
        } else {
          setUser(session.user);
          loadProjects();
          loadFinancialRecords();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      await loadProjects();
      await loadFinancialRecords();
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('adrian_projects')
        .select('project_id, project_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadFinancialRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      
      // Get project names separately
      const recordsWithProjects = await Promise.all(
        (data || []).map(async (record) => {
          const { data: projectData } = await supabase
            .from('adrian_projects')
            .select('project_name')
            .eq('project_id', record.project_id)
            .single();
          
          return {
            ...record,
            project: projectData
          };
        })
      );
      
      setFinancialRecords(recordsWithProjects);
    } catch (error) {
      console.error('Error loading financial records:', error);
    }
  };

  const handleFieldsExtracted = (fields: FinancialData, fileInfo?: {
    file: File;
    fileName: string;
    fileType: string;
  }) => {
    setFromEntity(fields.from_entity);
    setToEntity(fields.to_entity);
    setAmount(fields.amount.toString());
    setCurrency(fields.currency);
    setTransactionType(fields.transaction_type);
    setDescription(fields.description);
    setTransactionDate(fields.transaction_date);
    
    // Store file info if provided
    if (fileInfo) {
      setUploadedFileInfo(fileInfo);
    }
  };

  const saveFinancialRecord = async () => {
    if (!fromEntity || !toEntity || !amount || !selectedProject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a project.",
        variant: "destructive",
      });
      return;
    }

    try {
      let documentId = null;

      // If there's an uploaded file, save it to documents table and storage
      if (uploadedFileInfo) {
        // Get project name for path structure
        const { data: projectData } = await supabase
          .from('adrian_projects')
          .select('project_name')
          .eq('project_id', selectedProject)
          .single();

        const projectName = projectData?.project_name || selectedProject;

        // Create document record first to get the ID
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .insert({
            uploaded_by: user.id,
            project_id: selectedProject,
            title: `Financial Document - ${uploadedFileInfo.fileName}`,
            file_name: uploadedFileInfo.fileName,
            file_path: '', // Will be updated after upload
            file_type: uploadedFileInfo.fileType,
            file_size: uploadedFileInfo.file.size
          })
          .select()
          .single();

        if (documentError) throw documentError;
        
        documentId = documentData.id;

        // Upload file to Documents bucket with structured path
        const filePath = `${projectName}/Financial/${documentId}/${uploadedFileInfo.fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, uploadedFileInfo.file);

        if (uploadError) throw uploadError;

        // Update document record with correct file path and url
        const { error: updateError } = await supabase
          .from('documents')
          .update({ file_path: filePath, file_url: filePath })
          .eq('id', documentId);

        if (updateError) throw updateError;
      }

      // Create financial record with document_id if file was uploaded
      const { error } = await supabase
        .from('financial_records')
        .insert({
          user_id: user.id,
          created_by: user.id,
          project_id: selectedProject,
          transaction_type: transactionType,
          from_entity: fromEntity,
          to_entity: toEntity,
          amount: parseFloat(amount),
          currency: currency,
          description: description,
          transaction_date: transactionDate,
          document_id: documentId
        });

      if (error) throw error;

      // Clear form
      setFromEntity('');
      setToEntity('');
      setAmount('');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setUploadedFileInfo(null);
      
      // Reload records
      await loadFinancialRecords();

      toast({
        title: "Record Saved",
        description: uploadedFileInfo 
          ? "Financial record and document have been saved successfully."
          : "Financial record has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving financial record:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save financial record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadFinancialRecords();
      toast({
        title: "Record Deleted",
        description: "Financial record has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Type', 'From', 'To', 'Amount', 'Currency', 'Project', 'Description'].join(','),
      ...filteredRecords.map(record => 
        [
          record.transaction_date,
          record.transaction_type,
          record.from_entity,
          record.to_entity,
          record.amount,
          record.currency,
          record.project?.project_name || record.project_id,
          record.description || ''
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial_records.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and search logic
  const filteredRecords = financialRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      record.from_entity.toLowerCase().includes(searchLower) ||
      record.to_entity.toLowerCase().includes(searchLower) ||
      record.description?.toLowerCase().includes(searchLower) ||
      record.project?.project_name?.toLowerCase().includes(searchLower);
    
    const matchesType = filterType === 'all' || record.transaction_type === filterType;
    const matchesProject = filterProject === 'all' || record.project_id === filterProject;
    const matchesCurrency = filterCurrency === 'all' || record.currency === filterCurrency;
    
    const matchesEntity = filterEntity === 'all' || 
      record.from_entity.toLowerCase().includes(filterEntity.toLowerCase()) ||
      record.to_entity.toLowerCase().includes(filterEntity.toLowerCase());
    
    const matchesDateRange = 
      (!filterFromDate || record.transaction_date >= filterFromDate) &&
      (!filterToDate || record.transaction_date <= filterToDate);
    
    return matchesSearch && matchesType && matchesProject && matchesCurrency && matchesEntity && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get unique values for filters
  const uniqueCurrencies = [...new Set(financialRecords.map(r => r.currency))];
  const uniqueProjects = [...new Set(financialRecords.map(r => r.project_id))];
  const uniqueEntities = [...new Set([
    ...financialRecords.map(r => r.from_entity),
    ...financialRecords.map(r => r.to_entity)
  ])].sort();

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case 'income': return 'default';
      case 'expense': return 'destructive';
      case 'investment': return 'secondary';
      default: return 'outline';
    }
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
      
      <main className="container mx-auto px-4 sm:px-6 py-20" dir="ltr">
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
              <Calculator className="h-8 w-8 text-accent" />
              Financial Analysis
            </h1>
            <p className="text-muted-foreground">
              Analyze your business financial performance and metrics
            </p>
          </div>

          <div className="space-y-6">
            {/* Top Row: Upload Document & Voice Input */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Upload Financial Document */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Financial Document
                </h3>
                <FinancialFileUpload onFieldsExtracted={handleFieldsExtracted} />
              </div>

              {/* Right: Voice Input Assistant */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Input Assistant
                </h3>
                <FinancialVoiceRecorder onFieldsExtracted={handleFieldsExtracted} />
              </div>
            </div>

            {/* Bottom Row: Manual Entry Form */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Enter Financial Transaction
                </CardTitle>
                <CardDescription>
                  Manually input transaction details or edit extracted data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project *</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project..." />
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
                    <Label htmlFor="transactionType">Transaction Type *</Label>
                    <Select value={transactionType} onValueChange={(value: 'income' | 'expense' | 'investment') => setTransactionType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEntity">From Entity *</Label>
                    <Input
                      id="fromEntity"
                      placeholder="Who paid/issued..."
                      value={fromEntity}
                      onChange={(e) => setFromEntity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toEntity">To Entity *</Label>
                    <Input
                      id="toEntity"
                      placeholder="Who received/was paid..."
                      value={toEntity}
                      onChange={(e) => setToEntity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="IRR">IRR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionDate">Date</Label>
                    <Input
                      id="transactionDate"
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Transaction description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button
                  onClick={saveFinancialRecord}
                  className="w-full bg-gradient-accent"
                >
                  Save Financial Record
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Financial Records Table */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Financial Records ({filteredRecords.length})</span>
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={filteredRecords.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage and analyze your financial transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterProject} onValueChange={setFilterProject}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.project_id} value={project.project_id}>
                              {project.project_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {uniqueCurrencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Second row: Entity and Date Range Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Select value={filterEntity} onValueChange={setFilterEntity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by person/company..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Entities</SelectItem>
                          {uniqueEntities.map((entity) => (
                            <SelectItem key={entity} value={entity}>
                              {entity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="fromDate" className="text-xs text-muted-foreground">From Date</Label>
                        <Input
                          id="fromDate"
                          type="date"
                          value={filterFromDate}
                          onChange={(e) => setFilterFromDate(e.target.value)}
                          className="w-full sm:w-40"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="toDate" className="text-xs text-muted-foreground">To Date</Label>
                        <Input
                          id="toDate"
                          type="date"
                          value={filterToDate}
                          onChange={(e) => setFilterToDate(e.target.value)}
                          className="w-full sm:w-40"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('transaction_date')}
                        >
                          <div className="flex items-center gap-1">
                            Date
                            {sortField === 'transaction_date' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('transaction_type')}
                        >
                          <div className="flex items-center gap-1">
                            Type
                            {sortField === 'transaction_type' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('from_entity')}
                        >
                          <div className="flex items-center gap-1">
                            From
                            {sortField === 'from_entity' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('to_entity')}
                        >
                          <div className="flex items-center gap-1">
                            To
                            {sortField === 'to_entity' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('amount')}
                        >
                          <div className="flex items-center gap-1">
                            Amount
                            {sortField === 'amount' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {financialRecords.length === 0 ? 'No financial records found. Add your first transaction above.' : 'No records match your search criteria.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {new Date(record.transaction_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getTransactionBadgeVariant(record.transaction_type)}>
                                {record.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-32 truncate" title={record.from_entity}>
                              {record.from_entity}
                            </TableCell>
                            <TableCell className="max-w-32 truncate" title={record.to_entity}>
                              {record.to_entity}
                            </TableCell>
                            <TableCell className="font-medium">
                              {record.currency} {record.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="max-w-32 truncate" title={record.project?.project_name || record.project_id}>
                              {record.project?.project_name || record.project_id}
                            </TableCell>
                            <TableCell className="max-w-32 truncate" title={record.description}>
                              {record.description || '-'}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this financial record? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(record.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FinancialAnalysisPage;