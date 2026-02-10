
-- ============================================
-- PHASE 1A: Role sync trigger
-- ============================================

-- Create trigger function for job_type → user_roles sync
CREATE OR REPLACE FUNCTION public.sync_job_type_to_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL AND (
    TG_OP = 'INSERT' 
    OR OLD.job_type IS DISTINCT FROM NEW.job_type 
    OR OLD.user_id IS DISTINCT FROM NEW.user_id
  ) THEN
    DELETE FROM public.user_roles WHERE user_id = NEW.user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.job_type::app_role);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger on employees table
CREATE TRIGGER trigger_sync_job_type_to_user_roles
  AFTER INSERT OR UPDATE OF job_type, user_id ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_job_type_to_user_roles();

-- ============================================
-- PHASE 1B: Profiles cleanup
-- ============================================

-- Drop full_name and avatar_url from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS avatar_url;

-- Simplify handle_new_user trigger (only insert id + email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Migrate EMP005 hire_date to start_date
UPDATE public.employees 
SET start_date = hire_date 
WHERE hire_date IS NOT NULL AND start_date IS NULL;

-- ============================================
-- PHASE 1B: Create employee_full VIEW
-- ============================================

CREATE OR REPLACE VIEW public.employee_full AS
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
