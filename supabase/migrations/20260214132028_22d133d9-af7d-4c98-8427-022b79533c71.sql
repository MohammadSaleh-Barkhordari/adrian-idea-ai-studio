
-- First drop the RLS policy that depends on created_by
DROP POLICY IF EXISTS "Creators can view own letters" ON public.letters;

-- Now drop unused columns
ALTER TABLE public.letters DROP COLUMN IF EXISTS subject;
ALTER TABLE public.letters DROP COLUMN IF EXISTS body;
ALTER TABLE public.letters DROP COLUMN IF EXISTS preview_image_url;
ALTER TABLE public.letters DROP COLUMN IF EXISTS final_image_url;
ALTER TABLE public.letters DROP COLUMN IF EXISTS preview_generated_at;
ALTER TABLE public.letters DROP COLUMN IF EXISTS final_generated_at;
ALTER TABLE public.letters DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.letters DROP COLUMN IF EXISTS letter_title;

-- Add file_path column
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS file_path text;

-- Migrate data from file_url to file_path
UPDATE public.letters SET file_path = file_url WHERE file_url IS NOT NULL AND file_path IS NULL;

-- Drop file_url
ALTER TABLE public.letters DROP COLUMN IF EXISTS file_url;

-- Re-create the policy using user_id instead of created_by
CREATE POLICY "Creators can view own letters" ON public.letters FOR SELECT USING (user_id = auth.uid());
