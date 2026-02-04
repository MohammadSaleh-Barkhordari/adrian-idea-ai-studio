-- Create financial_records table
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL,
  document_id UUID NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'investment')),
  from_entity TEXT NOT NULL,
  to_entity TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial_records
CREATE POLICY "Financial records are viewable by owner" 
ON public.financial_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Financial records are insertable by owner" 
ON public.financial_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Financial records are updatable by owner" 
ON public.financial_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Financial records are deletable by owner" 
ON public.financial_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_financial_records_updated_at
BEFORE UPDATE ON public.financial_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();