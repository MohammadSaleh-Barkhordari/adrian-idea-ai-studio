ALTER TABLE public.tasks
  DROP COLUMN IF EXISTS predecessor_request_id,
  DROP COLUMN IF EXISTS successor_request_id;