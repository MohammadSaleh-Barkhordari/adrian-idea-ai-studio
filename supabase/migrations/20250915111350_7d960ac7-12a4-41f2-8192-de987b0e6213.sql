-- Enable required extension for UUID generation (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create enums if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'adrian_project_status'
  ) THEN
    CREATE TYPE public.adrian_project_status AS ENUM ('planning','in_progress','on_hold','completed','cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'adrian_project_priority'
  ) THEN
    CREATE TYPE public.adrian_project_priority AS ENUM ('low','medium','high','urgent');
  END IF;
END$$;

-- Projects table
CREATE TABLE IF NOT EXISTS public.adrian_projects (
  project_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  client_name TEXT,
  client_company TEXT,
  description TEXT,
  status public.adrian_project_status NOT NULL DEFAULT 'planning',
  priority public.adrian_project_priority NOT NULL DEFAULT 'medium',
  budget NUMERIC,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL REFERENCES public.adrian_projects(project_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Letters table
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL REFERENCES public.adrian_projects(project_id) ON DELETE CASCADE,
  document_id UUID NULL REFERENCES public.documents(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_position TEXT NOT NULL,
  recipient_company TEXT NOT NULL,
  date DATE NOT NULL,
  user_request TEXT NOT NULL,
  writer_name TEXT,
  generated_subject TEXT,
  generated_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adrian_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Policies for adrian_projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'adrian_projects' AND policyname = 'Projects are viewable by owner'
  ) THEN
    CREATE POLICY "Projects are viewable by owner"
      ON public.adrian_projects
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'adrian_projects' AND policyname = 'Projects are insertable by owner'
  ) THEN
    CREATE POLICY "Projects are insertable by owner"
      ON public.adrian_projects
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'adrian_projects' AND policyname = 'Projects are updatable by owner'
  ) THEN
    CREATE POLICY "Projects are updatable by owner"
      ON public.adrian_projects
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'adrian_projects' AND policyname = 'Projects are deletable by owner'
  ) THEN
    CREATE POLICY "Projects are deletable by owner"
      ON public.adrian_projects
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Policies for documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Documents are viewable by owner'
  ) THEN
    CREATE POLICY "Documents are viewable by owner"
      ON public.documents
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Documents are insertable by owner'
  ) THEN
    CREATE POLICY "Documents are insertable by owner"
      ON public.documents
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Documents are updatable by owner'
  ) THEN
    CREATE POLICY "Documents are updatable by owner"
      ON public.documents
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Documents are deletable by owner'
  ) THEN
    CREATE POLICY "Documents are deletable by owner"
      ON public.documents
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Policies for letters
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'letters' AND policyname = 'Letters are viewable by owner'
  ) THEN
    CREATE POLICY "Letters are viewable by owner"
      ON public.letters
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'letters' AND policyname = 'Letters are insertable by owner'
  ) THEN
    CREATE POLICY "Letters are insertable by owner"
      ON public.letters
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'letters' AND policyname = 'Letters are updatable by owner'
  ) THEN
    CREATE POLICY "Letters are updatable by owner"
      ON public.letters
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'letters' AND policyname = 'Letters are deletable by owner'
  ) THEN
    CREATE POLICY "Letters are deletable by owner"
      ON public.letters
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_adrian_projects_updated_at'
  ) THEN
    CREATE TRIGGER trg_adrian_projects_updated_at
    BEFORE UPDATE ON public.adrian_projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_documents_updated_at'
  ) THEN
    CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_letters_updated_at'
  ) THEN
    CREATE TRIGGER trg_letters_updated_at
    BEFORE UPDATE ON public.letters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_adrian_projects_user_id ON public.adrian_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON public.letters(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_project_id ON public.letters(project_id);
CREATE INDEX IF NOT EXISTS idx_letters_document_id ON public.letters(document_id);
