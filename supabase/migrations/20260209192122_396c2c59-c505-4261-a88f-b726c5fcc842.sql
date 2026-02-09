
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completion_notes text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completion_date date;
