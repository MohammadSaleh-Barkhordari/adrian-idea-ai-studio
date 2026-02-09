
-- Remove the overly permissive policy since the receive-email webhook will use the service role client which bypasses RLS
DROP POLICY "Service role can insert emails" ON public.emails;
