-- Create new enums for the tables (avoiding conflicts with existing ones)
CREATE TYPE public.calendar_type AS ENUM ('gregorian', 'hijri_shamsi');
CREATE TYPE public.transaction_direction AS ENUM ('income', 'outcome');
CREATE TYPE public.transaction_type AS ENUM ('cash', 'card', 'bank');
CREATE TYPE public.adrian_project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE public.adrian_project_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.document_status AS ENUM ('draft', 'review', 'approved', 'archived');

-- Create adrian_projects table first (since it's referenced by other tables)
CREATE TABLE public.adrian_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  client_name TEXT,
  project_manager TEXT,
  description TEXT,
  status adrian_project_status NOT NULL DEFAULT 'planning',
  priority adrian_project_priority NOT NULL DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_title TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT,
  document_format TEXT,
  project_id UUID REFERENCES public.adrian_projects(id) ON DELETE CASCADE,
  status document_status NOT NULL DEFAULT 'draft',
  creation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  file_url TEXT,
  summary TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create finance table
CREATE TABLE public.finance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_type calendar_type NOT NULL DEFAULT 'gregorian',
  date DATE NOT NULL,
  description TEXT NOT NULL,
  transaction_direction transaction_direction NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payer TEXT,
  payee TEXT,
  project_id UUID REFERENCES public.adrian_projects(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create letters table
CREATE TABLE public.letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  writer_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_position TEXT,
  recipient_company TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  letter_number TEXT,
  project_id UUID REFERENCES public.adrian_projects(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  user_request TEXT,
  subject_line TEXT,
  body TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.adrian_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for adrian_projects
CREATE POLICY "Users can view their own projects" 
ON public.adrian_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.adrian_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.adrian_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.adrian_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for finance
CREATE POLICY "Users can view their own finance records" 
ON public.finance 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own finance records" 
ON public.finance 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance records" 
ON public.finance 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance records" 
ON public.finance 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for letters
CREATE POLICY "Users can view their own letters" 
ON public.letters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own letters" 
ON public.letters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters" 
ON public.letters 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letters" 
ON public.letters 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_adrian_projects_updated_at
BEFORE UPDATE ON public.adrian_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_updated_at
BEFORE UPDATE ON public.finance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_letters_updated_at
BEFORE UPDATE ON public.letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_adrian_projects_user_id ON public.adrian_projects(user_id);
CREATE INDEX idx_adrian_projects_project_id ON public.adrian_projects(project_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_project_id ON public.documents(project_id);
CREATE INDEX idx_finance_user_id ON public.finance(user_id);
CREATE INDEX idx_finance_project_id ON public.finance(project_id);
CREATE INDEX idx_letters_user_id ON public.letters(user_id);
CREATE INDEX idx_letters_project_id ON public.letters(project_id);