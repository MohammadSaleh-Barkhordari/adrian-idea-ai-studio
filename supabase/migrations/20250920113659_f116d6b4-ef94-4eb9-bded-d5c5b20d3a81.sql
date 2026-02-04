-- Add new columns to letters table for image generation workflow
ALTER TABLE public.letters ADD COLUMN preview_image_url TEXT;
ALTER TABLE public.letters ADD COLUMN final_image_url TEXT;
ALTER TABLE public.letters ADD COLUMN needs_signature BOOLEAN DEFAULT false;
ALTER TABLE public.letters ADD COLUMN needs_stamp BOOLEAN DEFAULT false;
ALTER TABLE public.letters ADD COLUMN preview_generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.letters ADD COLUMN final_generated_at TIMESTAMP WITH TIME ZONE;