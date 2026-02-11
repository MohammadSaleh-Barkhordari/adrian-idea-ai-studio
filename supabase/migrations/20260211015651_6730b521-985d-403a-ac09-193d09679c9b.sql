
-- Migration 2F: Drop deprecated columns

-- Safety net: migrate hire_date data to start_date
UPDATE employees SET start_date = hire_date 
WHERE hire_date IS NOT NULL AND start_date IS NULL;

-- Drop deprecated columns from employees
ALTER TABLE employees DROP COLUMN IF EXISTS email;
ALTER TABLE employees DROP COLUMN IF EXISTS work_email;
ALTER TABLE employees DROP COLUMN IF EXISTS phone;
ALTER TABLE employees DROP COLUMN IF EXISTS hire_date;

-- Drop deprecated columns from employee_sensitive_data
ALTER TABLE employee_sensitive_data DROP COLUMN IF EXISTS emergency_contact;
ALTER TABLE employee_sensitive_data DROP COLUMN IF EXISTS contract_url;

-- Migration 2G: Recreate employee_full VIEW with all new columns
DROP VIEW IF EXISTS public.employee_full;

CREATE VIEW public.employee_full 
WITH (security_invoker = true) AS
SELECT 
  p.id as user_id,
  p.email as work_email,
  e.id as employee_id,
  e.name,
  e.surname,
  TRIM(COALESCE(e.name, '') || ' ' || COALESCE(e.surname, '')) as full_name,
  e.name_fa,
  e.surname_fa,
  e.nationality,
  e.job_title,
  e.department,
  e.status,
  e.employment_type,
  e.job_type,
  e.employee_number,
  e.profile_photo_url,
  e.manager_id,
  e.work_location_type,
  e.start_date,
  e.end_date,
  e.probation_end_date,
  e.created_by,
  e.created_at
FROM public.profiles p
LEFT JOIN public.employees e ON e.user_id = p.id;
