-- Update RLS policy for requests to allow confirm_by users to view
DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
CREATE POLICY "Users can view own requests" 
ON public.requests 
FOR SELECT 
USING ((user_id = auth.uid()) OR (request_to = auth.uid()) OR (confirm_by = auth.uid()));