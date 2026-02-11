import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import EmployeeFormDocuments from '@/components/hr/EmployeeFormDocuments';
import EmployeeFormInsurance from '@/components/hr/EmployeeFormInsurance';

interface Employee {
  id: string;
  name: string;
  surname: string;
  job_title: string | null;
  job_type: string | null;
  employee_number: string | null;
  department: string | null;
  status: string;
  user_id: string | null;
  profile_photo_url?: string | null;
  nationality?: string | null;
  name_fa?: string | null;
  surname_fa?: string | null;
  employment_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  probation_end_date?: string | null;
  manager_id?: string | null;
  work_location_type?: string | null;
}

interface EmployeeFormProps {
  employee?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ManagerOption {
  id: string;
  name: string;
  surname: string;
  job_title: string | null;
}

const EmployeeForm = ({ employee, onSuccess, onCancel }: EmployeeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [formData, setFormData] = useState({
    // Documents tab
    user_id: '',
    profile_photo_url: '',
    // Personal tab
    name: '',
    surname: '',
    nationality: '',
    name_fa: '',
    surname_fa: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    national_id: '',
    military_service_status: '',
    personal_email: '',
    phone_number: '',
    home_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    // Employment tab
    employee_number: '',
    job_title: '',
    department: '',
    status: 'active',
    employment_type: '',
    start_date: '',
    end_date: '',
    probation_end_date: '',
    manager_id: '',
    work_location_type: '',
    job_type: 'general_user',
    employment_contract_id: '',
    contract_type: '',
    // Banking tab
    salary: '',
    pay_frequency: 'monthly',
    bank_account_type: '',
    bank_name: '',
    bank_account_number: '',
    sort_code: '',
    bank_sheba: '',
    // Insurance & Tax tab
    insurance_number: '',
    insurance_start_date: '',
    insurance_type: '',
    tax_id: '',
    tax_exemption_status: '',
  });

  const { toast } = useToast();

  const isIranian = formData.nationality === 'Iranian';
  const isMale = formData.gender === 'male';

  useEffect(() => {
    const loadManagers = async () => {
      const query = supabase
        .from('employees')
        .select('id, name, surname, job_title')
        .order('name');
      
      if (employee?.id) {
        query.neq('id', employee.id);
      }

      const { data } = await query;
      if (data) setManagers(data);
    };
    loadManagers();
  }, [employee?.id]);

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (employee) {
        setDataLoading(true);
        const { data: sensitiveData } = await supabase
          .from('employee_sensitive_data')
          .select('*')
          .eq('employee_id', employee.id)
          .maybeSingle();

        setFormData({
          user_id: employee.user_id || '',
          profile_photo_url: employee.profile_photo_url || '',
          name: employee.name || '',
          surname: employee.surname || '',
          nationality: employee.nationality || '',
          name_fa: employee.name_fa || '',
          surname_fa: employee.surname_fa || '',
          date_of_birth: sensitiveData?.date_of_birth || '',
          gender: sensitiveData?.gender || '',
          marital_status: sensitiveData?.marital_status || '',
          national_id: sensitiveData?.national_id || '',
          military_service_status: sensitiveData?.military_service_status || '',
          personal_email: sensitiveData?.personal_email || '',
          phone_number: sensitiveData?.phone_number || '',
          home_address: sensitiveData?.home_address || '',
          emergency_contact_name: sensitiveData?.emergency_contact_name || '',
          emergency_contact_phone: sensitiveData?.emergency_contact_phone || '',
          emergency_contact_relationship: sensitiveData?.emergency_contact_relationship || '',
          employee_number: employee.employee_number || '',
          job_title: employee.job_title || '',
          department: employee.department || '',
          status: employee.status || 'active',
          employment_type: employee.employment_type || '',
          start_date: employee.start_date || '',
          end_date: employee.end_date || '',
          probation_end_date: employee.probation_end_date || '',
          manager_id: employee.manager_id || '',
          work_location_type: employee.work_location_type || '',
          job_type: employee.job_type || 'general_user',
          employment_contract_id: sensitiveData?.employment_contract_id || '',
          contract_type: sensitiveData?.contract_type || '',
          salary: sensitiveData?.salary ? sensitiveData.salary.toString() : '',
          pay_frequency: sensitiveData?.pay_frequency || 'monthly',
          bank_account_type: sensitiveData?.bank_account_type || '',
          bank_name: sensitiveData?.bank_name || '',
          bank_account_number: sensitiveData?.bank_account_number || '',
          sort_code: sensitiveData?.sort_code || '',
          bank_sheba: sensitiveData?.bank_sheba || '',
          insurance_number: sensitiveData?.insurance_number || '',
          insurance_start_date: sensitiveData?.insurance_start_date || '',
          insurance_type: sensitiveData?.insurance_type || '',
          tax_id: sensitiveData?.tax_id || '',
          tax_exemption_status: sensitiveData?.tax_exemption_status || '',
        });
        setDataLoading(false);
      } else {
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

      const userId = formData.user_id || employee?.user_id;
      if (!userId) {
        throw new Error('Associated User is required');
      }

      const employeeData = {
        name: formData.name,
        surname: formData.surname,
        nationality: formData.nationality || null,
        name_fa: formData.name_fa || null,
        surname_fa: formData.surname_fa || null,
        job_title: formData.job_title || null,
        job_type: formData.job_type || null,
        employee_number: formData.employee_number || null,
        department: formData.department || null,
        status: formData.status,
        employment_type: formData.employment_type || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        probation_end_date: formData.probation_end_date || null,
        manager_id: formData.manager_id || null,
        work_location_type: formData.work_location_type || null,
        user_id: userId,
        created_by: currentUser.data.user.id,
        profile_photo_url: formData.profile_photo_url || null,
      };

      const sensitiveData = {
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        national_id: formData.national_id || null,
        military_service_status: formData.military_service_status || null,
        personal_email: formData.personal_email || null,
        phone_number: formData.phone_number || null,
        home_address: formData.home_address || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relationship: formData.emergency_contact_relationship || null,
        employment_contract_id: formData.employment_contract_id || null,
        contract_type: formData.contract_type || null,
        bank_account_type: formData.bank_account_type || null,
        bank_account_number: formData.bank_account_number || null,
        bank_name: formData.bank_name || null,
        sort_code: formData.sort_code || null,
        bank_sheba: formData.bank_sheba || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        pay_frequency: formData.pay_frequency,
        insurance_number: formData.insurance_number || null,
        insurance_start_date: formData.insurance_start_date || null,
        insurance_type: formData.insurance_type || null,
        tax_id: formData.tax_id || null,
        tax_exemption_status: formData.tax_exemption_status || null,
      };

      let employeeId: string;

      if (employee) {
        const { error: updateError } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);
        if (updateError) throw updateError;
        employeeId = employee.id;

        const { error: sensitiveUpdateError } = await supabase
          .from('employee_sensitive_data')
          .upsert({ employee_id: employeeId, ...sensitiveData }, { onConflict: 'employee_id' });
        if (sensitiveUpdateError) throw sensitiveUpdateError;
      } else {
        const { data: newEmployee, error: insertError } = await supabase
          .from('employees')
          .insert([employeeData])
          .select()
          .single();
        if (insertError) throw insertError;
        employeeId = newEmployee.id;

        const { error: sensitiveInsertError } = await supabase
          .from('employee_sensitive_data')
          .insert({ employee_id: employeeId, ...sensitiveData });
        if (sensitiveInsertError) throw sensitiveInsertError;

        if (profilePhotoFile) {
          const filePath = `${employeeId}/profile/${profilePhotoFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('employee-documents')
            .upload(filePath, profilePhotoFile, { upsert: true });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('employee-documents')
              .getPublicUrl(filePath);

            await supabase
              .from('employees')
              .update({ profile_photo_url: urlData.publicUrl })
              .eq('id', employeeId);
          }
        }
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

  const showEndDate = formData.status === 'terminated' || formData.employment_type === 'contract';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
          <TabsTrigger value="insurance">Insurance & Tax</TabsTrigger>
        </TabsList>

        {/* Tab 1: Documents */}
        <TabsContent value="documents" className="space-y-4">
          <EmployeeFormDocuments
            formData={formData}
            setFormData={setFormData}
            employee={employee ? { id: employee.id, user_id: employee.user_id } : null}
            profilePhotoFile={profilePhotoFile}
            setProfilePhotoFile={setProfilePhotoFile}
            dataLoading={dataLoading}
          />
        </TabsContent>

        {/* Tab 2: Personal */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Row 1: Name / Surname */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name (English) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Surname (English) *</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Nationality */}
              <div>
                <Label htmlFor="nationality">Nationality *</Label>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iranian">Iranian</SelectItem>
                    <SelectItem value="Afghan">Afghan</SelectItem>
                    <SelectItem value="Iraqi">Iraqi</SelectItem>
                    <SelectItem value="Turkish">Turkish</SelectItem>
                    <SelectItem value="British">British</SelectItem>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="Canadian">Canadian</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Pakistani">Pakistani</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Australian">Australian</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 3: Persian Name/Surname (conditional) */}
              {isIranian && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_fa">Name (Persian)</Label>
                    <Input
                      id="name_fa"
                      value={formData.name_fa}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_fa: e.target.value }))}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname_fa">Surname (Persian)</Label>
                    <Input
                      id="surname_fa"
                      value={formData.surname_fa}
                      onChange={(e) => setFormData(prev => ({ ...prev, surname_fa: e.target.value }))}
                      dir="rtl"
                    />
                  </div>
                </div>
              )}

              {/* Row 4: DOB / Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 5: Marital Status / National ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marital_status">Marital Status</Label>
                  <Select
                    value={formData.marital_status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, marital_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isIranian && (
                  <div>
                    <Label htmlFor="national_id">National ID (کد ملی)</Label>
                    <Input
                      id="national_id"
                      value={formData.national_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Row 6: Military Service (conditional) */}
              {isIranian && isMale && (
                <div>
                  <Label htmlFor="military_service_status">Military Service Status</Label>
                  <Select
                    value={formData.military_service_status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, military_service_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="exempt">Exempt</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="not_applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Row 7: Email / Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="personal_email">Personal Email</Label>
                  <Input
                    id="personal_email"
                    type="email"
                    value={formData.personal_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, personal_email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">Personal Phone</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 8: Home Address */}
              <div>
                <Label htmlFor="home_address">Home Address</Label>
                <Textarea
                  id="home_address"
                  value={formData.home_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, home_address: e.target.value }))}
                />
              </div>

              <Separator />

              {/* Emergency Contact Section */}
              <h4 className="text-sm font-semibold text-muted-foreground">Emergency Contact</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Select
                  value={formData.emergency_contact_relationship}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, emergency_contact_relationship: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Employment */}
        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>Job and employment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Row 1: Employee Number / Job Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_number">Employee Number *</Label>
                  <Input
                    id="employee_number"
                    value={formData.employee_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_number: e.target.value }))}
                    required
                    readOnly={!!employee}
                    className={employee ? 'bg-muted' : ''}
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

              {/* Row 2: Department / Employment Type */}
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
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Status / Work Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Employment Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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
                <div>
                  <Label htmlFor="work_location_type">Work Location</Label>
                  <Select
                    value={formData.work_location_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, work_location_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="office_based">Office Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Start Date / End Date (conditional) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                {showEndDate && (
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Row 5: Probation / Manager */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="probation_end_date">Probation End Date</Label>
                  <Input
                    id="probation_end_date"
                    type="date"
                    value={formData.probation_end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, probation_end_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="manager_id">Manager</Label>
                  <Select
                    value={formData.manager_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} {m.surname}{m.job_title ? ` — ${m.job_title}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 6: Job Type */}
              <div>
                <Label htmlFor="job_type">Job Type (Permissions) *</Label>
                <Select
                  value={formData.job_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, job_type: value }))}
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

              <Separator />

              {/* Contract Details */}
              <h4 className="text-sm font-semibold text-muted-foreground">Contract Details</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employment_contract_id">Contract ID</Label>
                  <Input
                    id="employment_contract_id"
                    value={formData.employment_contract_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, employment_contract_id: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="contract_type">Contract Type</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contract_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="fixed_term">Fixed Term</SelectItem>
                      <SelectItem value="project_based">Project Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Banking */}
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
                    onValueChange={(value) => setFormData(prev => ({ ...prev, pay_frequency: value }))}
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bank_account_type: value }))}
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

        {/* Tab 5: Insurance & Tax */}
        <TabsContent value="insurance" className="space-y-4">
          <EmployeeFormInsurance />
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
