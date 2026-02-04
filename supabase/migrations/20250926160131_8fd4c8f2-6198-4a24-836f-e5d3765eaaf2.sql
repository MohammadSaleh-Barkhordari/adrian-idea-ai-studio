-- Fix the sync_employee_role_to_user_roles trigger function to properly cast between enum types
CREATE OR REPLACE FUNCTION public.sync_employee_role_to_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Handle INSERT and UPDATE operations
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Only proceed if user_id and job_type are not null
    IF NEW.user_id IS NOT NULL AND NEW.job_type IS NOT NULL THEN
      -- Delete existing role for this user (in case of job_type change)
      DELETE FROM public.user_roles WHERE user_id = NEW.user_id;
      
      -- Insert new role based on job_type (cast via text to avoid enum casting issues)
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.user_id, NEW.job_type::text::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE operation
  IF TG_OP = 'DELETE' THEN
    -- Remove user role when employee is deleted
    IF OLD.user_id IS NOT NULL THEN
      DELETE FROM public.user_roles WHERE user_id = OLD.user_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$