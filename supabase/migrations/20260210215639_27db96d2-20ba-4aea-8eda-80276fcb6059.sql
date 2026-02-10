
-- Fix SECURITY DEFINER view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.employee_full;

CREATE VIEW public.employee_full 
WITH (security_invoker = true)
AS
SELECT 
  p.id as user_id,
  p.email as work_email,
  e.id as employee_id,
  e.name,
  e.surname,
  TRIM(COALESCE(e.name, '') || ' ' || COALESCE(e.surname, '')) as full_name,
  e.job_title,
  e.department,
  e.employment_type,
  e.job_type,
  e.employee_number,
  e.start_date,
  e.end_date,
  e.created_by,
  e.created_at
FROM public.profiles p
LEFT JOIN public.employees e ON e.user_id = p.id;
