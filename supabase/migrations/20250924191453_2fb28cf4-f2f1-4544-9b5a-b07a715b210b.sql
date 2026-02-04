-- Create calendar events table for personal planning
CREATE TABLE public.our_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_name TEXT NOT NULL CHECK (person_name IN ('Raiana', 'Mohammad')),
  event_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.our_calendar ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar events (same access as our_financial)
CREATE POLICY "Calendar events are viewable by specific users" 
ON public.our_calendar 
FOR SELECT 
USING (auth.email() = ANY (ARRAY['raianasattari@gmail.com'::text, 'mosba1991@gmail.com'::text]));

CREATE POLICY "Calendar events are insertable by specific users" 
ON public.our_calendar 
FOR INSERT 
WITH CHECK (auth.email() = ANY (ARRAY['raianasattari@gmail.com'::text, 'mosba1991@gmail.com'::text]) AND auth.uid() = user_id);

CREATE POLICY "Calendar events are updatable by specific users" 
ON public.our_calendar 
FOR UPDATE 
USING (auth.email() = ANY (ARRAY['raianasattari@gmail.com'::text, 'mosba1991@gmail.com'::text]) AND auth.uid() = user_id);

CREATE POLICY "Calendar events are deletable by specific users" 
ON public.our_calendar 
FOR DELETE 
USING (auth.email() = ANY (ARRAY['raianasattari@gmail.com'::text, 'mosba1991@gmail.com'::text]) AND auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_our_calendar_updated_at
BEFORE UPDATE ON public.our_calendar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();