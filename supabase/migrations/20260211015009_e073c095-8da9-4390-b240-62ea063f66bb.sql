
-- ============================================
-- Phase 2A: New columns on employees
-- ============================================
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS name_fa text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS surname_fa text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS probation_end_date date;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.employees(id);
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS work_location_type text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- ============================================
-- Phase 2C: New columns on employee_sensitive_data
-- ============================================
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS marital_status text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS military_service_status text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS contract_type text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS insurance_number text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS insurance_start_date date;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS insurance_type text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS tax_exemption_status text;

-- ============================================
-- Phase 2D: Create employee_documents table
-- ============================================
CREATE TABLE public.employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  title text,
  file_url text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  expiry_date date,
  ai_extracted_data jsonb,
  ai_verified boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all employee documents"
  ON public.employee_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view own documents"
  ON public.employee_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = employee_documents.employee_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE INDEX idx_employee_documents_employee_id ON public.employee_documents(employee_id);

CREATE TRIGGER update_employee_documents_updated_at
  BEFORE UPDATE ON public.employee_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Phase 2E: Storage bucket + policies
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-documents', 'employee-documents', false);

CREATE POLICY "Admins can upload employee documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'employee-documents'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can view all employee documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'employee-documents'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete employee documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'employee-documents'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Employees can view own employee documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'employee-documents'
    AND EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id::text = (storage.foldername(name))[1]
      AND employees.user_id = auth.uid()
    )
  );
