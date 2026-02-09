
-- Table: emails
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL DEFAULT '',
  body_text TEXT,
  body_html TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'draft', 'received')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  resend_id TEXT,
  in_reply_to UUID REFERENCES public.emails(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: email_attachments
CREATE TABLE public.email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: email_contacts
CREATE TABLE public.email_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, email)
);

-- Enable RLS on all tables
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for emails
CREATE POLICY "Users can view own emails" ON public.emails FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own emails" ON public.emails FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own emails" ON public.emails FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own emails" ON public.emails FOR DELETE USING (user_id = auth.uid());
-- Service role insert for receive-email webhook (no user context)
CREATE POLICY "Service role can insert emails" ON public.emails FOR INSERT WITH CHECK (true);

-- RLS policies for email_attachments
CREATE POLICY "Users can view own attachments" ON public.email_attachments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.emails WHERE emails.id = email_attachments.email_id AND emails.user_id = auth.uid()));
CREATE POLICY "Users can insert own attachments" ON public.email_attachments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.emails WHERE emails.id = email_attachments.email_id AND emails.user_id = auth.uid()));
CREATE POLICY "Users can delete own attachments" ON public.email_attachments FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.emails WHERE emails.id = email_attachments.email_id AND emails.user_id = auth.uid()));

-- RLS policies for email_contacts
CREATE POLICY "Users can view own contacts" ON public.email_contacts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own contacts" ON public.email_contacts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own contacts" ON public.email_contacts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own contacts" ON public.email_contacts FOR DELETE USING (user_id = auth.uid());

-- Composite index for fast folder queries
CREATE INDEX idx_emails_folder_query ON public.emails (user_id, direction, is_deleted, is_archived, created_at DESC);

-- Updated_at trigger for emails
CREATE TRIGGER update_emails_updated_at
  BEFORE UPDATE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime on emails table
ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;

-- Storage bucket for email attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('email-attachments', 'email-attachments', false);

-- Storage policies for email-attachments bucket
CREATE POLICY "Users can upload email attachments" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own email attachments" ON storage.objects FOR SELECT
  USING (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own email attachments" ON storage.objects FOR DELETE
  USING (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
