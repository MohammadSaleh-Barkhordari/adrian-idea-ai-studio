-- Create task_comments table for comment notifications
CREATE TABLE public.task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentioned_users UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view comments on their assigned tasks" ON public.task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_comments.task_id 
      AND (tasks.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create comments" ON public.task_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON public.task_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON public.task_comments
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all comments" ON public.task_comments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();