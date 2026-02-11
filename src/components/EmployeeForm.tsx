import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import ContractUpload from './ContractUpload';
import UserSelector from './UserSelector';

interface Employee {
  id: string;
  name: string;
  surname: string;
  job_title: string | null;
  job_type: string | null;
  employee_number: string | null;
  department: string | null;
  status: string;
  hire_date: string | null;
  email: string | null;
  phone: string | null;
  user_id: string | null;
}

interface EmployeeSensitiveData {
  home_address?: string;
  phone_number?: string;
  date_of_birth?: string;
  personal_email?: string;
  national_id?: string;
  bank_account_type?: 'iranian_bank' | 'international_bank';
  bank_account_number?: string;
  bank_name?: string;
  sort_code?: string;
  bank_sheba?: string;
  salary?: number;
  pay_frequency?: 'monthly' | 'bi_weekly' | 'weekly' | 'annual';
  employment_contract_id?: string;
}

interface EmployeeFormProps {
  employee?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const EmployeeForm = ({ employee, onSuccess, onCancel }: EmployeeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    home_address: '',
    phone_number: '',
    date_of_birth: undefined as Date | undefined,
    personal_email: '',
    national_id: '',
    job_title: '',
    job_type: 'general_user',
    employee_number: '',
    department: '',
    status: 'active',
    hire_date: undefined as Date | undefined,
    email: '',
    phone: '',
    bank_account_type: '',
    bank_account_number: '',
    bank_name: '',
    sort_code: '',
    bank_sheba: '',
    salary: '',
    pay_frequency: 'monthly',
    employment_contract_id: '',
    user_id: '',
    contract_file_url: '',
    contract_file_name: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (employee) {
        setDataLoading(true);
        // Fetch sensitive data separately
        const { data: sensitiveData } = await supabase
          .from('employee_sensitive_data')
          .select('*')
          .eq('employee_id', employee.id)
          .single();

        setFormData({
          name: employee.name || '',
          surname: employee.surname || '',
          home_address: sensitiveData?.home_address || '',
          phone_number: sensitiveData?.phone_number || '',
          date_of_birth: sensitiveData?.date_of_birth ? new Date(sensitiveData.date_of_birth) : undefined,
          personal_email: sensitiveData?.personal_email || '',
          national_id: sensitiveData?.national_id || '',
          job_title: employee.job_title || '',
          job_type: employee.job_type || 'general_user',
          employee_number: employee.employee_number || '',
          department: employee.department || '',
          status: (employee as any).status || 'active',
          hire_date: employee.hire_date ? new Date(employee.hire_date) : undefined,
          email: employee.email || '',
          phone: employee.phone || '',
          bank_account_type: sensitiveData?.bank_account_type || '',
          bank_account_number: sensitiveData?.bank_account_number || '',
          bank_name: sensitiveData?.bank_name || '',
          sort_code: sensitiveData?.sort_code || '',
          bank_sheba: sensitiveData?.bank_sheba || '',
          salary: sensitiveData?.salary ? sensitiveData.salary.toString() : '',
          pay_frequency: sensitiveData?.pay_frequency || 'monthly',
          employment_contract_id: sensitiveData?.employment_contract_id || '',
          user_id: employee.user_id || '',
          contract_file_url: '',
          contract_file_name: '',
        });
        setDataLoading(false);
      } else {
        // Generate employee number for new employees
        generateEmployeeNumber();
      }
    };
    
    loadEmployeeData();
  }, [employee]);

  const generateEmployeeNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('employee_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 'EMP001';
      if (data && data.length > 0) {
        const lastNumber = data[0].employee_number;
        const numberPart = parseInt(lastNumber.replace('EMP', '')) + 1;
        nextNumber = `EMP${numberPart.toString().padStart(3, '0')}`;
      }

      setFormData(prev => ({ ...prev, employee_number: nextNumber }));
    } catch (error) {
      console.error('Error generating employee number:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) {
        throw new Error('No authenticated user');
      }

      // Validate required fields - fallback to employee.user_id for edit mode
      const userId = formData.user_id || employee?.user_id;
      if (!userId) {
        throw new Error('Associated User is required');
      }

      // Split data into basic employee info and sensitive data
      const employeeData = {
        name: formData.name,
        surname: formData.surname,
        job_title: formData.job_title || null,
        job_type: formData.job_type || null,
        employee_number: formData.employee_number || null,
        department: formData.department || null,
        status: formData.status,
        hire_date: formData.hire_date ? format(formData.hire_date, 'yyyy-MM-dd') : null,
        email: formData.email || null,
        phone: formData.phone || null,
        user_id: userId,
        created_by: currentUser.data.user.id,
      };

      const sensitiveData = {
        home_address: formData.home_address || null,
        phone_number: formData.phone_number || null,
        date_of_birth: formData.date_of_birth ? format(formData.date_of_birth, 'yyyy-MM-dd') : null,
        personal_email: formData.personal_email || null,
        national_id: formData.national_id || null,
        bank_account_type: formData.bank_account_type || null,
        bank_account_number: formData.bank_account_number || null,
        bank_name: formData.bank_name || null,
        sort_code: formData.sort_code || null,
        bank_sheba: formData.bank_sheba || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        pay_frequency: formData.pay_frequency,
        employment_contract_id: formData.employment_contract_id || null,
      };

      let employeeId: string;
      
      if (employee) {
        // Update existing employee
        const { error: updateError } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);
        
        if (updateError) throw updateError;
        employeeId = employee.id;
        
        // Update sensitive data
        const { error: sensitiveUpdateError } = await supabase
          .from('employee_sensitive_data')
          .upsert({
            employee_id: employeeId,
            ...sensitiveData
          }, { onConflict: 'employee_id' });
        
        if (sensitiveUpdateError) throw sensitiveUpdateError;

        // Role sync is handled automatically by database trigger on employees.job_type
      } else {
        // Insert new employee
        const { data: newEmployee, error: insertError } = await supabase
          .from('employees')
          .insert([employeeData])
          .select()
          .single();
        
        if (insertError) throw insertError;
        employeeId = newEmployee.id;
        
        // Insert sensitive data
        const { error: sensitiveInsertError } = await supabase
          .from('employee_sensitive_data')
          .insert({
            employee_id: employeeId,
            ...sensitiveData
          });
        
        if (sensitiveInsertError) throw sensitiveInsertError;

        // Role sync is handled automatically by database trigger on employees.job_type
      }

      toast({
        title: "Success",
        description: `Employee ${employee ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: `Failed to ${employee ? 'update' : 'create'} employee`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContractDataExtracted = (contractData: any) => {
    setFormData(prev => ({
      ...prev,
      // Personal Information
      name: contractData.name || prev.name,
      surname: contractData.surname || prev.surname,
      home_address: contractData.homeAddress || prev.home_address,
      phone_number: contractData.phoneNumber || prev.phone_number,
      date_of_birth: contractData.dateOfBirth ? new Date(contractData.dateOfBirth) : prev.date_of_birth,
      national_id: contractData.nationalId || prev.national_id,
      // Employment Information
      employment_contract_id: contractData.contractId || prev.employment_contract_id,
      job_title: contractData.jobTitle || prev.job_title,
      department: contractData.department || prev.department,
      status: contractData.employmentType || prev.status,
      hire_date: contractData.startDate ? new Date(contractData.startDate) : prev.hire_date,
      salary: contractData.salary || prev.salary,
      pay_frequency: contractData.payFrequency || prev.pay_frequency,
      email: contractData.workEmail || prev.email,
    }));

    // Show success toast
    toast({
      title: "Contract Analyzed Successfully",
      description: "Personal and employment details have been extracted and populated in the form. Please review and edit as needed.",
    });
  };

  const handleContractFileUploaded = (fileUrl: string, fileName: string) => {
    setFormData(prev => ({
      ...prev,
      contract_file_url: fileUrl,
      contract_file_name: fileName,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="contract" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Surname *</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="home_address">Home Address</Label>
                <Textarea
                  id="home_address"
                  value={formData.home_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, home_address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="national_id">National ID</Label>
                  <Input
                    id="national_id"
                    value={formData.national_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date_of_birth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_of_birth ? format(formData.date_of_birth, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date_of_birth}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date_of_birth: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>Job and employment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_number">Employee Number *</Label>
                  <Input
                    id="employee_number"
                    value={formData.employee_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_number: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="job_title">Job Title *</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, job_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_user">General User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Employment Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                      <SelectItem value="resigned">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hire Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.hire_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.hire_date ? format(formData.hire_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.hire_date}
                        onSelect={(date) => setFormData(prev => ({ ...prev, hire_date: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banking Information</CardTitle>
              <CardDescription>Salary and banking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pay_frequency">Pay Frequency</Label>
                  <Select
                    value={formData.pay_frequency}
                    onValueChange={(value: 'monthly' | 'bi_weekly' | 'weekly' | 'annual') => 
                      setFormData(prev => ({ ...prev, pay_frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bank_account_type">Bank Account Type</Label>
                <Select
                  value={formData.bank_account_type || ''}
                  onValueChange={(value: 'iranian_bank' | 'international_bank') => 
                    setFormData(prev => ({ ...prev, bank_account_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iranian_bank">Iranian Bank</SelectItem>
                    <SelectItem value="international_bank">International Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bank_account_number">Bank Account Number</Label>
                  <Input
                    id="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_account_number: e.target.value }))}
                  />
                </div>
              </div>

              {formData.bank_account_type === 'international_bank' && (
                <div>
                  <Label htmlFor="sort_code">Sort Code</Label>
                  <Input
                    id="sort_code"
                    value={formData.sort_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_code: e.target.value }))}
                  />
                </div>
              )}

              {formData.bank_account_type === 'iranian_bank' && (
                <div>
                  <Label htmlFor="bank_sheba">Bank Sheba</Label>
                  <Input
                    id="bank_sheba"
                    value={formData.bank_sheba}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_sheba: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
              <CardDescription>Upload and analyze employment contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Contract</h3>
                <ContractUpload 
                  onDataExtracted={handleContractDataExtracted}
                  onFileUploaded={handleContractFileUploaded}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="employment_contract_id">Contract ID</Label>
                  <Input
                    id="employment_contract_id"
                    value={formData.employment_contract_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, employment_contract_id: e.target.value }))}
                    placeholder="Contract reference number or ID"
                  />
                </div>

                <UserSelector
                  value={formData.user_id}
                  onValueChange={(value, email) => setFormData(prev => ({ 
                    ...prev, 
                    user_id: value,
                    personal_email: email || prev.personal_email
                  }))}
                  required={true}
                />

                {formData.personal_email && (
                  <div>
                    <Label htmlFor="auto_personal_email">Personal Email (Auto-populated)</Label>
                    <Input
                      id="auto_personal_email"
                      type="email"
                      value={formData.personal_email}
                      disabled
                      className="bg-muted"
                      placeholder="Email will be populated from selected user"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || dataLoading}>
          {dataLoading ? 'Loading...' : loading ? 'Saving...' : (employee ? 'Update Employee' : 'Create Employee')}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;