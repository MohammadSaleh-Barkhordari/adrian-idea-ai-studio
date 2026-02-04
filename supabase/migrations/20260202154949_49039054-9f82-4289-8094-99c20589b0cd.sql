-- Create helper function for looking up user ID by email (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(lookup_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_id uuid;
BEGIN
  SELECT id INTO result_id FROM profiles WHERE email = lookup_email;
  RETURN result_id;
END;
$$;

-- Issue 1: Fix profiles table - restrict to own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Issue 2: Add SELECT policy for employees table
CREATE POLICY "Users can view own employee record"
ON employees FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR user_id = auth.uid()
);

-- Issue 3: Add SELECT policy for adrian_projects
CREATE POLICY "Users can view assigned projects"
ON adrian_projects FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR assigned_to = auth.uid()
  OR user_id = auth.uid()
  OR created_by = auth.uid()
);