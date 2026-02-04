-- Step 1: Create employee_sensitive_data table for highly sensitive information
CREATE TABLE IF NOT EXISTS public.employee_sensitive_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL UNIQUE REFERENCES public.employees(id) ON DELETE CASCADE,
  
  -- Personal contact information
  personal_email text,
  phone_number text,
  home_address text,
  date_of_birth date,
  national_id text,
  
  -- Financial information
  salary numeric,
  pay_frequency pay_frequency,
  bank_name text,
  bank_account_number text,
  bank_sheba text,
  sort_code text,
  bank_account_type bank_account_type,
  
  -- Contract reference
  employment_contract_id text,
  
  -- Metadata
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Step 2: Enable RLS on the new table
ALTER TABLE public.employee_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Step 3: Create strict RLS policies - only admins can access sensitive data
CREATE POLICY "Only admins can view sensitive employee data"
ON public.employee_sensitive_data
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert sensitive employee data"
ON public.employee_sensitive_data
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update sensitive employee data"
ON public.employee_sensitive_data
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete sensitive employee data"
ON public.employee_sensitive_data
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 4: Migrate existing sensitive data to new table
INSERT INTO public.employee_sensitive_data (
  employee_id,
  personal_email,
  phone_number,
  home_address,
  date_of_birth,
  national_id,
  salary,
  pay_frequency,
  bank_name,
  bank_account_number,
  bank_sheba,
  sort_code,
  bank_account_type,
  employment_contract_id
)
SELECT 
  id,
  personal_email,
  phone_number,
  home_address,
  date_of_birth,
  national_id,
  salary,
  pay_frequency,
  bank_name,
  bank_account_number,
  bank_sheba,
  sort_code,
  bank_account_type,
  employment_contract_id
FROM public.employees
ON CONFLICT (employee_id) DO NOTHING;

-- Step 5: Remove sensitive columns from employees table (keep basic employment info only)
ALTER TABLE public.employees 
  DROP COLUMN IF EXISTS personal_email,
  DROP COLUMN IF EXISTS phone_number,
  DROP COLUMN IF EXISTS home_address,
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS national_id,
  DROP COLUMN IF EXISTS salary,
  DROP COLUMN IF EXISTS pay_frequency,
  DROP COLUMN IF EXISTS bank_name,
  DROP COLUMN IF EXISTS bank_account_number,
  DROP COLUMN IF EXISTS bank_sheba,
  DROP COLUMN IF EXISTS sort_code,
  DROP COLUMN IF EXISTS bank_account_type,
  DROP COLUMN IF EXISTS employment_contract_id;

-- Step 6: Add trigger for updated_at on sensitive data table
CREATE TRIGGER update_employee_sensitive_data_updated_at
BEFORE UPDATE ON public.employee_sensitive_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Update get_employee_sensitive_data function to use new table structure
CREATE OR REPLACE FUNCTION public.get_employee_sensitive_data(employee_id uuid)
RETURNS TABLE(
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
AS $function$
  SELECT 
    e.id,
    e.employee_number,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.home_address 
      ELSE '[REDACTED]'::text 
    END as home_address,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.phone_number 
      ELSE '[REDACTED]'::text 
    END as phone_number,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.personal_email 
      ELSE '[REDACTED]'::text 
    END as personal_email,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.date_of_birth 
      ELSE NULL 
    END as date_of_birth,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.national_id 
      ELSE '[REDACTED]'::text 
    END as national_id,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.salary 
      ELSE NULL 
    END as salary,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.pay_frequency 
      ELSE NULL 
    END as pay_frequency,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.bank_name 
      ELSE '[REDACTED]'::text 
    END as bank_name,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.bank_account_number 
      ELSE '[REDACTED]'::text 
    END as bank_account_number,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.bank_sheba 
      ELSE '[REDACTED]'::text 
    END as bank_sheba,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.sort_code 
      ELSE '[REDACTED]'::text 
    END as sort_code,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.bank_account_type 
      ELSE NULL 
    END as bank_account_type,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) 
      THEN s.employment_contract_id 
      ELSE '[REDACTED]'::text 
    END as employment_contract_id
  FROM public.employees e
  LEFT JOIN public.employee_sensitive_data s ON e.id = s.employee_id
  WHERE e.id = employee_id
  AND has_role(auth.uid(), 'admin'::app_role);
$function$;

-- Step 8: Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_employee_sensitive_data_employee_id 
ON public.employee_sensitive_data(employee_id);