-- Create all required enums
CREATE TYPE adrian_project_status AS ENUM ('planning', 'in_progress', 'completed', 'cancelled', 'on_hold');
CREATE TYPE adrian_project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE document_status AS ENUM ('draft', 'finalized', 'archived');
CREATE TYPE organizational_unit AS ENUM ('finance', 'hr', 'it', 'operations', 'marketing', 'other');
CREATE TYPE contract_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE contract_type AS ENUM ('service', 'product', 'employment', 'lease', 'other');
CREATE TYPE calendar_type AS ENUM ('gregorian', 'persian');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE transaction_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE project_status AS ENUM ('character_generating', 'character_ready', 'model_generating', 'model_ready', 'shipped', 'delivered');
CREATE TYPE toy_color_plan AS ENUM ('single_color', 'multi_color');
CREATE TYPE toy_material AS ENUM ('standard_pla', 'premium_resin');
CREATE TYPE toy_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE toy_style AS ENUM ('cartoon', 'realistic');

-- Create adrian_projects table
CREATE TABLE public.adrian_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id text NOT NULL,
  project_name text NOT NULL,
  client_name text,
  client_company text,
  description text,
  budget numeric,
  actual_cost numeric DEFAULT 0,
  start_date date,
  end_date date,
  status adrian_project_status NOT NULL DEFAULT 'planning',
  priority adrian_project_priority NOT NULL DEFAULT 'medium',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  contract_number text NOT NULL,
  title text NOT NULL,
  counterpart_name text,
  counterpart_id text,
  counterpart_phone text,
  counterpart_address text,
  counterpart_postal_code text,
  file_name text NOT NULL,
  file_type text,
  file_size bigint,
  file_path text,
  file_url text,
  user_email text,
  contract_type contract_type DEFAULT 'other',
  organization_unit organizational_unit DEFAULT 'other',
  amount numeric,
  currency text DEFAULT 'تومان',
  contract_duration integer,
  timeـunit text DEFAULT 'ماه',
  start_date text,
  end_date text,
  status contract_status DEFAULT 'pending',
  owner text,
  tags text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id uuid,
  document_name text NOT NULL,
  document_title text NOT NULL,
  document_type text,
  document_format text,
  summary text,
  file_url text,
  status document_status NOT NULL DEFAULT 'draft',
  creation_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create finance table
CREATE TABLE public.finance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id uuid,
  description text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  calendar_type calendar_type NOT NULL DEFAULT 'gregorian',
  transaction_type transaction_type NOT NULL,
  transaction_direction transaction_direction NOT NULL,
  payer text,
  payee text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create letters table
CREATE TABLE public.letters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id uuid,
  document_id uuid,
  writer_name text NOT NULL,
  recipient_name text NOT NULL,
  recipient_position text,
  recipient_company text,
  letter_number text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  user_request text,
  subject_line text,
  body text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_email text,
  title text NOT NULL,
  character_prompt text,
  character_image_path text,
  character_image_url text,
  original_image_path text,
  original_image_url text,
  model_preview_url text,
  model_3d_path text,
  model_3d_url text,
  "3d_format" text DEFAULT 'glb',
  toy_style toy_style NOT NULL DEFAULT 'cartoon',
  toy_color_plan toy_color_plan DEFAULT 'single_color',
  toy_material toy_material DEFAULT 'standard_pla',
  toy_size toy_size DEFAULT 'medium',
  price_cents integer DEFAULT 5999,
  estimated_delivery date,
  status project_status NOT NULL DEFAULT 'character_generating',
  order_number text,
  tracking_number text,
  shipping_address jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.documents ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.adrian_projects(id);
ALTER TABLE public.finance ADD CONSTRAINT finance_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.adrian_projects(id);
ALTER TABLE public.letters ADD CONSTRAINT letters_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.adrian_projects(id);
ALTER TABLE public.letters ADD CONSTRAINT letters_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);

-- Enable Row Level Security on all tables
ALTER TABLE public.adrian_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for adrian_projects
CREATE POLICY "Users can view their own projects" ON public.adrian_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.adrian_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.adrian_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.adrian_projects FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for contracts
CREATE POLICY "Users can view their own contracts" ON public.contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contracts" ON public.contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contracts" ON public.contracts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for finance
CREATE POLICY "Users can view their own finance records" ON public.finance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own finance records" ON public.finance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own finance records" ON public.finance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own finance records" ON public.finance FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for letters
CREATE POLICY "Users can view their own letters" ON public.letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own letters" ON public.letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own letters" ON public.letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own letters" ON public.letters FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);

-- Create database functions
CREATE OR REPLACE FUNCTION public.get_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $function$
  SELECT email FROM auth.users WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.generate_project_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  order_num TEXT;
BEGIN
  -- Generate order number with format: DT-YYYYMMDD-XXXX
  order_num := 'DT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Check if it exists, if so generate another
  WHILE EXISTS (SELECT 1 FROM public.projects WHERE order_number = order_num) LOOP
    order_num := 'DT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END LOOP;
  
  RETURN order_num;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  order_num TEXT;
BEGIN
  -- Generate order number with format: MW-YYYYMMDD-XXXX
  order_num := 'MW-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Check if it exists, if so generate another
  WHILE EXISTS (SELECT 1 FROM public.meetings WHERE order_number = order_num) LOOP
    order_num := 'MW-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END LOOP;
  
  RETURN order_num;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  RETURN NEW;
END;
$function$;

-- Create profiles table for the handle_new_user trigger
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email text,
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_adrian_projects_updated_at BEFORE UPDATE ON public.adrian_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_updated_at BEFORE UPDATE ON public.finance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_letters_updated_at BEFORE UPDATE ON public.letters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();