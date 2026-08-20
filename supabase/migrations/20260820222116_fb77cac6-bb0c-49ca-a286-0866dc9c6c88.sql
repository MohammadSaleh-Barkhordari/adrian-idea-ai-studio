DROP POLICY IF EXISTS "Users can manage own calendar" ON public.our_calendar;
DROP POLICY IF EXISTS "Users can manage own todos" ON public.our_todos;

CREATE POLICY "Our Life users can manage all calendar events"
ON public.our_calendar FOR ALL TO authenticated
USING (auth.uid() = ANY (ARRAY['19db583e-1e4a-4a20-9f3c-591cb2ca3dc7'::uuid, '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'::uuid]))
WITH CHECK (auth.uid() = ANY (ARRAY['19db583e-1e4a-4a20-9f3c-591cb2ca3dc7'::uuid, '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'::uuid]));

CREATE POLICY "Our Life users can manage all todos"
ON public.our_todos FOR ALL TO authenticated
USING (auth.uid() = ANY (ARRAY['19db583e-1e4a-4a20-9f3c-591cb2ca3dc7'::uuid, '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'::uuid]))
WITH CHECK (auth.uid() = ANY (ARRAY['19db583e-1e4a-4a20-9f3c-591cb2ca3dc7'::uuid, '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'::uuid]));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.our_calendar TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.our_todos TO authenticated;
GRANT ALL ON public.our_calendar TO service_role;
GRANT ALL ON public.our_todos TO service_role;