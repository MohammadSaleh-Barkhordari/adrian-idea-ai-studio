-- Phase 1: Schema Alignment Migration (Fixed)
-- First drop RLS policies that reference project_id, then alter columns, then recreate

-- ============================================
-- 1. DROP RLS POLICIES THAT REFERENCE project_id
-- ============================================

-- Documents policies
DROP POLICY IF EXISTS "Project members can view documents" ON documents;

-- Files policies  
DROP POLICY IF EXISTS "Project members can view files" ON files;

-- ============================================
-- 2. DOCUMENTS TABLE - Add missing columns and change project_id type
-- ============================================

-- Drop FK constraint on project_id
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_project_id_fkey;

-- Add missing columns
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type text;

-- Change project_id to text type
ALTER TABLE documents ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE documents ALTER COLUMN project_id TYPE text USING project_id::text;
ALTER TABLE documents ALTER COLUMN project_id DROP NOT NULL;

-- ============================================
-- 3. FILES TABLE - Change project_id to text type
-- ============================================

ALTER TABLE files DROP CONSTRAINT IF EXISTS files_project_id_fkey;
ALTER TABLE files ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE files ALTER COLUMN project_id TYPE text USING project_id::text;
ALTER TABLE files ALTER COLUMN project_id DROP NOT NULL;

-- ============================================
-- 4. EMPLOYEES TABLE - Add missing columns
-- ============================================

ALTER TABLE employees ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_email text;

-- ============================================
-- 5. FINANCIAL_RECORDS TABLE - Add missing columns and change project_id type
-- ============================================

-- Drop FK constraint on project_id
ALTER TABLE financial_records DROP CONSTRAINT IF EXISTS financial_records_project_id_fkey;

-- Add missing columns
ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS document_id uuid;
ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Change project_id to text type
ALTER TABLE financial_records ALTER COLUMN project_id TYPE text USING project_id::text;

-- ============================================
-- 6. BLOG_CATEGORIES TABLE - Add missing columns
-- ============================================

ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS language text DEFAULT 'fa';

-- ============================================
-- 7. LETTERS TABLE - Ensure project_id is text and add missing columns
-- ============================================

ALTER TABLE letters DROP CONSTRAINT IF EXISTS letters_project_id_fkey;
ALTER TABLE letters ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE letters ADD COLUMN IF NOT EXISTS letter_title text;
ALTER TABLE letters ADD COLUMN IF NOT EXISTS letter_number varchar;
ALTER TABLE letters ADD COLUMN IF NOT EXISTS has_attachment boolean DEFAULT false;
ALTER TABLE letters ALTER COLUMN project_id TYPE text USING project_id::text;

-- ============================================
-- 8. CREATE REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_by text NOT NULL,
  request_to uuid NOT NULL,
  due_date date,
  priority text NOT NULL DEFAULT 'medium',
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on requests
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for requests  
DROP POLICY IF EXISTS "Admins can manage requests" ON requests;
CREATE POLICY "Admins can manage requests" ON requests
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own requests" ON requests;
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (user_id = auth.uid() OR request_to = auth.uid());

-- ============================================
-- 9. RECREATE RLS POLICIES FOR DOCUMENTS AND FILES
-- ============================================

-- Documents: Project members can view documents via text project_id
CREATE POLICY "Project members can view documents" ON documents
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    EXISTS (
      SELECT 1 FROM adrian_projects ap 
      WHERE ap.project_id = documents.project_id 
      AND (ap.assigned_to = auth.uid() OR ap.user_id = auth.uid() OR ap.created_by = auth.uid())
    )
  );

-- Files: Project members can view files via text project_id
CREATE POLICY "Project members can view files" ON files
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    EXISTS (
      SELECT 1 FROM adrian_projects ap 
      WHERE ap.project_id = files.project_id 
      AND (ap.assigned_to = auth.uid() OR ap.user_id = auth.uid() OR ap.created_by = auth.uid())
    )
  );

-- ============================================
-- 10. USER_ROLES TABLE - Add updated_at column
-- ============================================

ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();