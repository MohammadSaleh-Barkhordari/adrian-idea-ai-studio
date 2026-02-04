-- Create our_financial table for personal financial records
CREATE TABLE public.our_financial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_for TEXT NOT NULL, -- costco, uber, etc.
  transaction_type TEXT NOT NULL, -- income, expense, investment
  who_paid TEXT NOT NULL, -- Mosba1991, Raianasattari, Both
  for_who TEXT NOT NULL, -- Mosba1991, Raianasattari, Both
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.our_financial ENABLE ROW LEVEL SECURITY;

-- Create policies for our_financial table (only for specific users)
CREATE POLICY "Our financial records are viewable by specific users" 
ON public.our_financial 
FOR SELECT 
USING (
  auth.email() IN ('raianasattari@gmail.com', 'mosba1991@gmail.com')
);

CREATE POLICY "Our financial records are insertable by specific users" 
ON public.our_financial 
FOR INSERT 
WITH CHECK (
  auth.email() IN ('raianasattari@gmail.com', 'mosba1991@gmail.com') AND
  auth.uid() = user_id
);

CREATE POLICY "Our financial records are updatable by specific users" 
ON public.our_financial 
FOR UPDATE 
USING (
  auth.email() IN ('raianasattari@gmail.com', 'mosba1991@gmail.com') AND
  auth.uid() = user_id
);

CREATE POLICY "Our financial records are deletable by specific users" 
ON public.our_financial 
FOR DELETE 
USING (
  auth.email() IN ('raianasattari@gmail.com', 'mosba1991@gmail.com') AND
  auth.uid() = user_id
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_our_financial_updated_at
BEFORE UPDATE ON public.our_financial
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();