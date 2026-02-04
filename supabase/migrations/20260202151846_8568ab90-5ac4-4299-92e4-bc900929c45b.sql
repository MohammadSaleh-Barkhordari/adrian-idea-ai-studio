-- Add UPDATE policy for blog_versions (only admins and original creator can update)
CREATE POLICY "Users can update own versions"
ON public.blog_versions
FOR UPDATE
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Add DELETE policy for blog_versions (only admins can delete versions)
CREATE POLICY "Admins can delete versions"
ON public.blog_versions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add UPDATE policy for blog_media (only uploader or admin can update)
CREATE POLICY "Users can update own media"
ON public.blog_media
FOR UPDATE
USING (uploaded_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));