ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS predecessor_task_id uuid,
  ADD COLUMN IF NOT EXISTS predecessor_request_id uuid,
  ADD COLUMN IF NOT EXISTS successor_task_id uuid,
  ADD COLUMN IF NOT EXISTS successor_request_id uuid;