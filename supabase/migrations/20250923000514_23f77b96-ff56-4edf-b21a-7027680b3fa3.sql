-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'general_user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'general_user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create employment type enum
CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contractor', 'intern');

-- Create job type enum  
CREATE TYPE public.job_type AS ENUM ('admin', 'general_user');

-- Create bank account type enum
CREATE TYPE public.bank_account_type AS ENUM ('iranian_bank', 'international_bank');

-- Create pay frequency enum
CREATE TYPE public.pay_frequency AS ENUM ('monthly', 'bi_weekly', 'weekly', 'annual');

-- Create employees table
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    home_address TEXT,
    phone_number TEXT,
    date_of_birth DATE,
    personal_email TEXT,
    job_title TEXT NOT NULL,
    job_type job_type NOT NULL DEFAULT 'general_user',
    employee_number TEXT UNIQUE NOT NULL,
    department TEXT,
    employment_type employment_type NOT NULL DEFAULT 'full_time',
    start_date DATE NOT NULL,
    end_date DATE,
    work_email TEXT,
    bank_account_type bank_account_type,
    bank_account_number TEXT,
    bank_name TEXT,
    sort_code TEXT,
    bank_sheba TEXT,
    salary NUMERIC(12,2),
    pay_frequency pay_frequency DEFAULT 'monthly',
    employment_contract_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL
);

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for employees
CREATE POLICY "Admins can view all employees" 
ON public.employees 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own employee record" 
ON public.employees 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all employees" 
ON public.employees 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own record" 
ON public.employees 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete employees" 
ON public.employees 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for HR documents
CREATE POLICY "Admins can view HR documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'Documents' AND (storage.foldername(name))[1] = 'HR' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload HR documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'Documents' AND (storage.foldername(name))[1] = 'HR' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update HR documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'Documents' AND (storage.foldername(name))[1] = 'HR' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete HR documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'Documents' AND (storage.foldername(name))[1] = 'HR' AND public.has_role(auth.uid(), 'admin'));

-- Users can view their own HR documents
CREATE POLICY "Users can view their own HR documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'Documents' AND (storage.foldername(name))[1] = 'HR' AND auth.uid()::text = (storage.foldername(name))[2]);