
-- 1. Fix our_financial RLS: allow both Our Life users to manage ALL records
DROP POLICY IF EXISTS "Users can manage own financial records" ON public.our_financial;

CREATE POLICY "Our Life users can view all financial records"
ON public.our_financial FOR SELECT
TO authenticated
USING (
  auth.uid() IN ('19db583e-1e4a-4a20-9f3c-591cb2ca3dc7'::uuid, '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'::uuid)
);

CREATE POLICY "Our Life users can insert financial records"
ON public.our_financial FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN ('19db583e-1e4a-4a20-9f3c-591cb2ca3dc7'::uuid, '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'::uuid)
);

CREATE POLICY "Our Life users can update financial records"
ON public.our_financial FOR UPDATE
TO authenticated
USING (
  auth.uid() IN ('19db583e-1e4a-4a20-9f3c-591cb2ca3dc7'::uuid, '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'::uuid)
);

CREATE POLICY "Our Life users can delete financial records"
ON public.our_financial FOR DELETE
TO authenticated
USING (
  auth.uid() IN ('19db583e-1e4a-4a20-9f3c-591cb2ca3dc7'::uuid, '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'::uuid)
);

-- 2. Clean up duplicate storage policies for our-life bucket
DROP POLICY IF EXISTS "Users can upload to our-life" ON storage.objects;
DROP POLICY IF EXISTS "Users can view our-life" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete from our-life" ON storage.objects;
