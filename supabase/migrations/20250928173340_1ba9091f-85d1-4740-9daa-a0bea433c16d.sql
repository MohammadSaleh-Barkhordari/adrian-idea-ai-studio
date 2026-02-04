-- Update RLS policies for documents table to be more user-friendly
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can create documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;

-- Create new, more permissive policies
-- Users can create documents (they own them via user_id)
CREATE POLICY "Users can create documents" 
ON public.documents 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Admins can do everything (keep admin access)
CREATE POLICY "Admins can manage all documents" 
ON public.documents 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));