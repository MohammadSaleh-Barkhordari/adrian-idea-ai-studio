-- Create custom types for the database
CREATE TYPE public.adrian_project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE public.adrian_project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.contract_type AS ENUM ('service', 'product', 'maintenance', 'consulting', 'other');
CREATE TYPE public.organizational_unit AS ENUM ('management', 'development', 'marketing', 'sales', 'support', 'other');
CREATE TYPE public.contract_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE public.document_status AS ENUM ('draft', 'review', 'approved', 'archived');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE public.transaction_direction AS ENUM ('incoming', 'outgoing');
CREATE TYPE public.calendar_type AS ENUM ('gregorian', 'persian');

-- Create adrian_projects table
CREATE TABLE public.adrian_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  client_name TEXT,
  client_company TEXT,
  description TEXT,
  status public.adrian_project_status NOT NULL DEFAULT 'planning',
  priority public.adrian_project_priority NOT NULL DEFAULT 'medium',
  budget NUMERIC,
  actual_cost NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on adrian_projects
ALTER TABLE public.adrian_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for adrian_projects
CREATE POLICY "Users can view their own projects" ON public.adrian_projects
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON public.adrian_projects
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.adrian_projects
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.adrian_projects
FOR DELETE USING (auth.uid() = user_id);

-- Create letters table
CREATE TABLE public.letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_position TEXT,
  recipient_company TEXT,
  writer_name TEXT NOT NULL,
  subject_line TEXT,
  body TEXT,
  user_request TEXT,
  letter_number TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  project_id UUID,
  document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on letters
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for letters
CREATE POLICY "Users can view their own letters" ON public.letters
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own letters" ON public.letters
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters" ON public.letters
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letters" ON public.letters
FOR DELETE USING (auth.uid() = user_id);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  counterpart_name TEXT,
  counterpart_id TEXT,
  counterpart_phone TEXT,
  counterpart_address TEXT,
  counterpart_postal_code TEXT,
  contract_type public.contract_type DEFAULT 'other',
  organization_unit public.organizational_unit DEFAULT 'other',
  amount NUMERIC,
  currency TEXT DEFAULT 'تومان',
  contract_duration INTEGER,
  timeـunit TEXT DEFAULT 'ماه',
  start_date TEXT,
  end_date TEXT,
  status public.contract_status DEFAULT 'pending',
  owner TEXT,
  tags TEXT[],
  user_email TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contracts
CREATE POLICY "Users can view their own contracts" ON public.contracts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contracts" ON public.contracts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts" ON public.contracts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts" ON public.contracts
FOR DELETE USING (auth.uid() = user_id);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_title TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT,
  document_format TEXT,
  summary TEXT,
  file_url TEXT,
  status public.document_status NOT NULL DEFAULT 'draft',
  creation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON public.documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
FOR DELETE USING (auth.uid() = user_id);

-- Create finance table
CREATE TABLE public.finance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  transaction_type public.transaction_type NOT NULL,
  transaction_direction public.transaction_direction NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  calendar_type public.calendar_type NOT NULL DEFAULT 'gregorian',
  payer TEXT,
  payee TEXT,
  project_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on finance
ALTER TABLE public.finance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for finance
CREATE POLICY "Users can view their own finance records" ON public.finance
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own finance records" ON public.finance
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance records" ON public.finance
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance records" ON public.finance
FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_adrian_projects_updated_at
BEFORE UPDATE ON public.adrian_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_letters_updated_at
BEFORE UPDATE ON public.letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
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