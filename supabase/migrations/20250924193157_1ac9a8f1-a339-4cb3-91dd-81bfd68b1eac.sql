-- Create enum types for todo management
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE todo_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create our_todos table for personal task management
CREATE TABLE public.our_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_name TEXT NOT NULL CHECK (person_name IN ('Raiana', 'Mohammad', 'Both')),
  task_title TEXT NOT NULL,
  description TEXT,
  priority todo_priority NOT NULL DEFAULT 'medium',
  status todo_status NOT NULL DEFAULT 'pending',
  category TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.our_todos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for specific users only
CREATE POLICY "Todo items are viewable by specific users" 
ON public.our_todos 
FOR SELECT 
USING (auth.email() = ANY (ARRAY['raianasattari@gmail.com'::text, 'mosba1991@gmail.com'::text]));

CREATE POLICY "Todo items are insertable by specific users" 
ON public.our_todos 
FOR INSERT 
WITH CHECK (
  (auth.email() = ANY (ARRAY['raianasattari@gmail.com'::text, 'mosba1991@gmail.com'::text])) 
  AND (auth.uid() = user_id)
);

CREATE POLICY "Todo items are updatable by specific users" 
ON public.our_todos 
FOR UPDATE 
USING (
  (auth.email() = ANY (ARRAY['raianasattari@gmail.com'::text, 'mosba1991@gmail.com'::text])) 
  AND (auth.uid() = user_id)
);

CREATE POLICY "Todo items are deletable by specific users" 
ON public.our_todos 
FOR DELETE 
USING (
  (auth.email() = ANY (ARRAY['raianasattari@gmail.com'::text, 'mosba1991@gmail.com'::text])) 
  AND (auth.uid() = user_id)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_our_todos_updated_at
BEFORE UPDATE ON public.our_todos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();