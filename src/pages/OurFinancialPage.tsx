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
import { ArrowLeft, Calculator, Upload, Mic, Edit, Search, Filter, Download, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendNotification, getOtherOurLifeUser, getOurLifeUserName } from '@/lib/notifications';
import OurFinancialFileUpload from '@/components/OurFinancialFileUpload';
import OurFinancialVoiceRecorder from '@/components/OurFinancialVoiceRecorder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface OurFinancialData {
  payment_for: string;
  transaction_type: 'income' | 'expense' | 'investment';
  who_paid: string;
  for_who: string;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string;
}

const OurFinancialPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [financialRecords, setFinancialRecords] = useState<any[]>([]);
  
  // Form fields
  const [paymentFor, setPaymentFor] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [whoPaid, setWhoPaid] = useState('');
  const [forWho, setForWho] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
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
      
      // Check if user has access to this page
      const allowedEmails = ['raianasattari@gmail.com', 'mosba1991@gmail.com'];
      if (!allowedEmails.includes(session.user.email)) {
        navigate('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadFinancialRecords();
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadFinancialRecords();
    }
  }, [user]);

  const loadFinancialRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('our_financial')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      setFinancialRecords(data || []);
    } catch (error) {
      console.error('Error loading our financial records:', error);
    }
  };

  const handleFieldsExtracted = (fields: OurFinancialData, fileInfo?: {
    file: File;
    fileName: string;
    fileType: string;
  }) => {
    setPaymentFor(fields.payment_for);
    setTransactionType(fields.transaction_type);
    setWhoPaid(fields.who_paid);
    setForWho(fields.for_who);
    setAmount(fields.amount.toString());
    setCurrency(fields.currency);
    setTransactionDate(fields.transaction_date);
    setDescription(fields.description);
    
    // Store file info if provided
    if (fileInfo) {
      setUploadedFileInfo(fileInfo);
    }
  };

  const saveFinancialRecord = async () => {
    if (!paymentFor || !whoPaid || !forWho || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      let documentId = null;

      // If there's an uploaded file, save it to documents table and Our_Life storage
      if (uploadedFileInfo) {
        // Create document record first to get the ID
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .insert({
            uploaded_by: user.id,
            project_id: 'our-life', // Using a standard project_id for our life
            title: `Our Financial Document - ${uploadedFileInfo.fileName}`,
            file_name: uploadedFileInfo.fileName,
            file_path: `OurLife/Financial/${uploadedFileInfo.fileName}`,
            file_type: uploadedFileInfo.fileType,
            file_size: uploadedFileInfo.file.size
          })
          .select()
          .single();

        if (documentError) throw documentError;
        
        documentId = documentData.id;

        // Upload file to our-life bucket with structured path
        const filePath = `Financial/${documentId}/${uploadedFileInfo.fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('our-life')
          .upload(filePath, uploadedFileInfo.file);

        if (uploadError) throw uploadError;

        // Update document record with file URL
        const { data: { publicUrl } } = supabase.storage
          .from('our-life')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('documents')
          .update({ file_url: publicUrl })
          .eq('id', documentId);

        if (updateError) throw updateError;
      }

      // Create our financial record (document is saved separately in documents table)
      const { error } = await supabase
        .from('our_financial')
        .insert({
          user_id: user.id,
          payment_for: paymentFor,
          transaction_type: transactionType,
          who_paid: whoPaid,
          for_who: forWho,
          amount: parseFloat(amount),
          currency: currency,
          description: description,
          transaction_date: transactionDate
        });

      if (error) throw error;

      // Send notification to the other Our Life user
      const otherUserId = getOtherOurLifeUser(user.id);
      if (otherUserId) {
        const actorName = getOurLifeUserName(user.id);
        await sendNotification(
          '💰 New Transaction',
          `${actorName} added: ${paymentFor} - ${currency} ${amount} (${transactionType})`,
          [otherUserId],
          'financial',
          '/our-financial'
        );
      }

      // Clear form
      setPaymentFor('');
      setWhoPaid('');
      setForWho('');
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
      console.error('Error saving our financial record:', error);
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

  const handleDelete = async (id: string, record?: any) => {
    try {
      const { error } = await supabase
        .from('our_financial')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Send notification to the other Our Life user
      if (user) {
        const otherUserId = getOtherOurLifeUser(user.id);
        if (otherUserId) {
          const actorName = getOurLifeUserName(user.id);
          const recordInfo = record 
            ? `${record.payment_for} - ${record.currency} ${record.amount}`
            : 'a transaction';
          await sendNotification(
            '💰 Transaction Removed',
            `${actorName} removed: ${recordInfo}`,
            [otherUserId],
            'financial',
            '/our-financial'
          );
        }
      }

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

  // Filter and search logic
  const filteredRecords = financialRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      record.payment_for.toLowerCase().includes(searchLower) ||
      record.who_paid.toLowerCase().includes(searchLower) ||
      record.for_who.toLowerCase().includes(searchLower) ||
      record.description?.toLowerCase().includes(searchLower);
    
    const matchesType = filterType === 'all' || record.transaction_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
      
      <main className="container mx-auto px-6 py-20" dir="ltr">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/our-life')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Our Life
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
              <Calculator className="h-8 w-8 text-accent" />
              Our Financial
            </h1>
            <p className="text-muted-foreground">
              Manage personal financial transactions and expenses
            </p>
          </div>

          <Tabs defaultValue="entry" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entry">Financial Entry</TabsTrigger>
              <TabsTrigger value="records">View Records</TabsTrigger>
            </TabsList>

            <TabsContent value="entry" className="space-y-6">
              {/* Top Row: Upload Document & Voice Input */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Upload Financial Document */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Financial Document
                  </h3>
                  <OurFinancialFileUpload onFieldsExtracted={handleFieldsExtracted} />
                </div>

                {/* Right: Voice Input Assistant */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Voice Input Assistant
                  </h3>
                  <OurFinancialVoiceRecorder onFieldsExtracted={handleFieldsExtracted} />
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
                      <Label htmlFor="paymentFor">Payment for what *</Label>
                      <Input
                        id="paymentFor"
                        placeholder="e.g., Costco, Uber, groceries..."
                        value={paymentFor}
                        onChange={(e) => setPaymentFor(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transactionType">Transaction Type *</Label>
                      <Select value={transactionType} onValueChange={(value: 'income' | 'expense' | 'investment') => setTransactionType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whoPaid">Who Paid *</Label>
                      <Select value={whoPaid} onValueChange={setWhoPaid}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select who paid" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mosba1991">Mosba1991</SelectItem>
                          <SelectItem value="Raianasattari">Raianasattari</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="forWho">For who *</Label>
                      <Select value={forWho} onValueChange={setForWho}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select for who" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mosba1991">Mosba1991</SelectItem>
                          <SelectItem value="Raianasattari">Raianasattari</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                          <SelectItem value="IRR">IRR (Toman)</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Additional notes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={saveFinancialRecord} className="w-full">
                    Save Financial Record
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Financial Records
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Records Table */}
                  <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-[700px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('transaction_date')}>
                            Date {sortField === 'transaction_date' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                          </TableHead>
                          <TableHead>Payment For</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Who Paid</TableHead>
                          <TableHead>For Who</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                            Amount {sortField === 'amount' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                          </TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{new Date(record.transaction_date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{record.payment_for}</TableCell>
                            <TableCell>
                              <Badge variant={getTransactionBadgeVariant(record.transaction_type)}>
                                {record.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.who_paid}</TableCell>
                            <TableCell>{record.for_who}</TableCell>
                            <TableCell className="font-mono">
                              {record.amount} {record.currency}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
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
                                    <AlertDialogAction onClick={() => handleDelete(record.id, record)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {Math.min((currentPage - 1) * pageSize + 1, filteredRecords.length)} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OurFinancialPage;