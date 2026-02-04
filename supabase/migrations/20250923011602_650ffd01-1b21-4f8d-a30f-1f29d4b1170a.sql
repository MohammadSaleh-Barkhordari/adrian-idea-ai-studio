-- Drop the existing restrictive admin-only insert policy
DROP POLICY "Admins can insert employees" ON public.employees;

-- Create a new policy that allows all authenticated users to create employees
-- but only if they set themselves as the creator
CREATE POLICY "Users can create employees" 
ON public.employees 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);