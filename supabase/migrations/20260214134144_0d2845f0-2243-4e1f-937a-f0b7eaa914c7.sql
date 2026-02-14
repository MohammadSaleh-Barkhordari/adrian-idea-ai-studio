ALTER TABLE public.letters DROP CONSTRAINT IF EXISTS letters_status_check;
ALTER TABLE public.letters ADD CONSTRAINT letters_status_check 
  CHECK (status = ANY (ARRAY[
    'pending', 'analyzing', 'letter_generated', 'completed', 'error',
    'fields_extracted', 'preview_generated', 'final_generated'
  ]));