-- Create a view for non-sensitive employee data that general users can access
CREATE OR REPLACE VIEW public.employee_basic_info AS
SELECT 
  id,
  employee_number,
  name,
  surname,
  work_email,
  department,
  job_title,
  job_type,
  employment_type,
  start_date,
  end_date,
  created_at,
  updated_at,
  user_id,
  created_by
FROM public.employees;

-- Create security definer function to get employee sensitive data with proper authorization
CREATE OR REPLACE FUNCTION public.get_employee_sensitive_data(employee_id uuid)
RETURNS TABLE (
  id uuid,
  employee_number text,
  home_address text,
  phone_number text,
  personal_email text,
  date_of_birth date,
  national_id text,
  salary numeric,
  pay_frequency pay_frequency,
  bank_name text,
  bank_account_number text,
  bank_sheba text,
  sort_code text,
  bank_account_type bank_account_type,
  employment_contract_id text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.id,
    e.employee_number,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) OR e.user_id = auth.uid() 
      THEN e.home_address 
      ELSE '[REDACTED]'::text 
    END as home_address,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) OR e.user_id = auth.uid() 
      THEN e.phone_number 
      ELSE '[REDACTED]'::text 
    END as phone_number,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) OR e.user_id = auth.uid() 
      THEN e.personal_email 
      ELSE '[REDACTED]'::text 
    END as personal_email,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) OR e.user_id = auth.uid() 
      THEN e.date_of_birth 
      ELSE NULL 
    END as date_of_birth,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.national_id 
      ELSE '[REDACTED]'::text 
    END as national_id,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.salary 
      ELSE NULL 
    END as salary,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.pay_frequency 
      ELSE NULL 
    END as pay_frequency,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.bank_name 
      ELSE '[REDACTED]'::text 
    END as bank_name,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.bank_account_number 
      ELSE '[REDACTED]'::text 
    END as bank_account_number,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.bank_sheba 
      ELSE '[REDACTED]'::text 
    END as bank_sheba,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.sort_code 
      ELSE '[REDACTED]'::text 
    END as sort_code,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.bank_account_type 
      ELSE NULL 
    END as bank_account_type,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN e.employment_contract_id 
      ELSE '[REDACTED]'::text 
    END as employment_contract_id
  FROM public.employees e
  WHERE e.id = employee_id
  AND (has_role(auth.uid(), 'admin'::app_role) OR e.user_id = auth.uid());
$$;

-- Create audit log table for tracking access to sensitive employee data
CREATE TABLE IF NOT EXISTS public.employee_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by uuid NOT NULL,
  employee_id uuid NOT NULL,
  access_type text NOT NULL,
  accessed_fields text[],
  access_timestamp timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.employee_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view access logs" 
ON public.employee_data_access_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_employee_id uuid,
  p_access_type text,
  p_accessed_fields text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.employee_data_access_log (
    accessed_by,
    employee_id, 
    access_type,
    accessed_fields
  ) VALUES (
    auth.uid(),
    p_employee_id,
    p_access_type,
    p_accessed_fields
  );
END;
$$;

-- Create secure function for updating only non-sensitive employee data by regular users
CREATE OR REPLACE FUNCTION public.update_employee_basic_info(
  p_employee_id uuid,
  p_name text DEFAULT NULL,
  p_surname text DEFAULT NULL,
  p_work_email text DEFAULT NULL,
  p_department text DEFAULT NULL,
  p_job_title text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission to update this employee record
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR 
          EXISTS(SELECT 1 FROM public.employees WHERE id = p_employee_id AND user_id = auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized access to employee record';
  END IF;

  -- Update only non-sensitive fields
  UPDATE public.employees 
  SET 
    name = COALESCE(p_name, name),
    surname = COALESCE(p_surname, surname),
    work_email = COALESCE(p_work_email, work_email),
    department = COALESCE(p_department, department),
    job_title = COALESCE(p_job_title, job_title),
    updated_at = now()
  WHERE id = p_employee_id;

  -- Log the access for audit purposes
  PERFORM public.log_sensitive_data_access(
    p_employee_id,
    'update_basic_info',
    ARRAY['name', 'surname', 'work_email', 'department', 'job_title']
  );

  RETURN FOUND;
END;
$$;