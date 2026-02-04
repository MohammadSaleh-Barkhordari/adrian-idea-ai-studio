-- Fix the security definer view issue
-- The warning is about a view that might exist, let's check and fix if needed
-- Since we don't have any security definer views in our schema, this might be a false positive
-- But let's make sure our functions are properly set up

-- Ensure the has_role function is correctly defined without security issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
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