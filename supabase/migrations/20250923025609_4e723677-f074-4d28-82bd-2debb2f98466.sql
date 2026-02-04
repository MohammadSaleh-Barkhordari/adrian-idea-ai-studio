-- Create junction tables for many-to-many relationships between tasks and other entities

-- Junction table for tasks and letters (many-to-many)
CREATE TABLE public.task_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  letter_id UUID NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, letter_id)
);

-- Junction table for tasks and documents (many-to-many)
CREATE TABLE public.task_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, document_id)
);

-- Enable RLS on junction tables
ALTER TABLE public.task_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_letters
CREATE POLICY "Admins can view all task letters" 
ON public.task_letters 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create task letters" 
ON public.task_letters 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update task letters" 
ON public.task_letters 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete task letters" 
ON public.task_letters 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for task_documents
CREATE POLICY "Admins can view all task documents" 
ON public.task_documents 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create task documents" 
ON public.task_documents 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update task documents" 
ON public.task_documents 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete task documents" 
ON public.task_documents 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for better performance
CREATE INDEX idx_task_letters_task_id ON public.task_letters(task_id);
CREATE INDEX idx_task_letters_letter_id ON public.task_letters(letter_id);
CREATE INDEX idx_task_documents_task_id ON public.task_documents(task_id);
CREATE INDEX idx_task_documents_document_id ON public.task_documents(document_id);