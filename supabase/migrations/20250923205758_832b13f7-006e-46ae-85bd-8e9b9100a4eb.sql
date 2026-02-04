-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS sync_employee_role_insert_trigger ON public.employees;
DROP TRIGGER IF EXISTS sync_employee_role_update_trigger ON public.employees;
DROP TRIGGER IF EXISTS sync_employee_role_delete_trigger ON public.employees;

-- Create triggers to automatically sync employees table with user_roles table

-- Trigger for INSERT operations
CREATE TRIGGER sync_employee_role_insert_trigger
    AFTER INSERT ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_employee_role_to_user_roles();

-- Trigger for UPDATE operations
CREATE TRIGGER sync_employee_role_update_trigger
    AFTER UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_employee_role_to_user_roles();

-- Trigger for DELETE operations
CREATE TRIGGER sync_employee_role_delete_trigger
    AFTER DELETE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_employee_role_to_user_roles();

-- Initial data synchronization: sync existing employees with user_roles
-- Map job_type values to app_role values
INSERT INTO public.user_roles (user_id, role)
SELECT 
  e.user_id, 
  CASE 
    WHEN e.job_type = 'admin'::job_type THEN 'admin'::app_role
    WHEN e.job_type = 'general_user'::job_type THEN 'general_user'::app_role
    ELSE 'general_user'::app_role
  END as role
FROM public.employees e
WHERE e.user_id IS NOT NULL 
  AND e.job_type IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = e.user_id
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Update existing user_roles that don't match current employee job_type
UPDATE public.user_roles 
SET role = CASE 
  WHEN e.job_type = 'admin'::job_type THEN 'admin'::app_role
  WHEN e.job_type = 'general_user'::job_type THEN 'general_user'::app_role
  ELSE 'general_user'::app_role
END
FROM public.employees e
WHERE user_roles.user_id = e.user_id
  AND e.job_type IS NOT NULL;