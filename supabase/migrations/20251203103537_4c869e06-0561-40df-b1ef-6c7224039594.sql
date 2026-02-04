-- =============================================
-- FULL SCHEMA ALIGNMENT MIGRATION
-- =============================================

-- 1. ADD MISSING COLUMNS TO adrian_projects
ALTER TABLE public.adrian_projects 
ADD COLUMN IF NOT EXISTS client_company text,
ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2. ADD MISSING COLUMNS TO tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS related_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL;

-- 3. ADD MISSING COLUMNS TO files
ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS user_id uuid,
ADD COLUMN IF NOT EXISTS description text;

-- 4. ADD MISSING COLUMNS TO letters
ALTER TABLE public.letters 
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS mime_type text;

-- 5. ADD MISSING COLUMNS TO documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS file_url text;

-- 6. ADD MISSING COLUMNS TO employee_sensitive_data
ALTER TABLE public.employee_sensitive_data 
ADD COLUMN IF NOT EXISTS bank_account_type text,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS sort_code text,
ADD COLUMN IF NOT EXISTS bank_sheba text,
ADD COLUMN IF NOT EXISTS pay_frequency text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS employment_contract_id text;

-- 7. ADD MISSING COLUMNS TO employees
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- =============================================
-- CREATE JUNCTION TABLES
-- =============================================

-- 8. Create task_letters junction table
CREATE TABLE IF NOT EXISTS public.task_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  letter_id uuid NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(task_id, letter_id)
);

-- 9. Create task_documents junction table
CREATE TABLE IF NOT EXISTS public.task_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(task_id, document_id)
);

-- 10. Create task_files junction table
CREATE TABLE IF NOT EXISTS public.task_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(task_id, file_id)
);

-- =============================================
-- ENABLE RLS ON JUNCTION TABLES
-- =============================================

ALTER TABLE public.task_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR JUNCTION TABLES
-- =============================================

-- task_letters policies
CREATE POLICY "Admins can manage task_letters" 
ON public.task_letters 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view task_letters for their tasks" 
ON public.task_letters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_letters.task_id 
    AND (tasks.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- task_documents policies
CREATE POLICY "Admins can manage task_documents" 
ON public.task_documents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view task_documents for their tasks" 
ON public.task_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_documents.task_id 
    AND (tasks.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- task_files policies
CREATE POLICY "Admins can manage task_files" 
ON public.task_files 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view task_files for their tasks" 
ON public.task_files 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_files.task_id 
    AND (tasks.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_task_letters_task_id ON public.task_letters(task_id);
CREATE INDEX IF NOT EXISTS idx_task_letters_letter_id ON public.task_letters(letter_id);
CREATE INDEX IF NOT EXISTS idx_task_documents_task_id ON public.task_documents(task_id);
CREATE INDEX IF NOT EXISTS idx_task_documents_document_id ON public.task_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON public.task_files(task_id);
CREATE INDEX IF NOT EXISTS idx_task_files_file_id ON public.task_files(file_id);
CREATE INDEX IF NOT EXISTS idx_tasks_related_task_id ON public.tasks(related_task_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);