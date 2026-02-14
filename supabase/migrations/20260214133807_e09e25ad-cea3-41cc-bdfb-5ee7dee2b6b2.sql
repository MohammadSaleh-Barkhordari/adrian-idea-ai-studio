CREATE POLICY "Creators can update own letters"
  ON public.letters
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());