
-- Table 1: customers
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_name_fa text,
  industry text,
  company_size text CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  website text,
  email text,
  phone text,
  address text,
  city text,
  country text DEFAULT 'Iran',
  customer_status text NOT NULL DEFAULT 'lead' CHECK (customer_status IN ('lead', 'prospect', 'active', 'inactive', 'churned')),
  contract_type text CHECK (contract_type IN ('project_based', 'retainer', 'subscription', 'one_time')),
  contract_start_date date,
  contract_end_date date,
  monthly_value numeric,
  currency text DEFAULT 'IRR' CHECK (currency IN ('IRR', 'USD', 'EUR', 'GBP')),
  logo_url text,
  brand_color text,
  linkedin_url text,
  instagram_url text,
  notes text,
  tags text[] DEFAULT '{}',
  account_manager_id uuid REFERENCES employees(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all customers"
  ON public.customers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view customers"
  ON public.customers FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM employees WHERE user_id IS NOT NULL));

CREATE INDEX idx_customers_status ON public.customers(customer_status);
CREATE INDEX idx_customers_account_manager ON public.customers(account_manager_id);

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Table 2: customer_contacts
CREATE TABLE public.customer_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  first_name_fa text,
  last_name_fa text,
  job_title text,
  department text,
  email text,
  phone text,
  mobile text,
  linkedin_url text,
  is_primary_contact boolean DEFAULT false,
  is_decision_maker boolean DEFAULT false,
  contact_type text DEFAULT 'business' CHECK (contact_type IN ('business', 'technical', 'billing', 'executive')),
  is_active boolean DEFAULT true,
  photo_url text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all contacts"
  ON public.customer_contacts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view contacts"
  ON public.customer_contacts FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM employees WHERE user_id IS NOT NULL));

CREATE INDEX idx_customer_contacts_customer_id ON public.customer_contacts(customer_id);
CREATE INDEX idx_customer_contacts_primary ON public.customer_contacts(customer_id) WHERE is_primary_contact = true;

CREATE TRIGGER update_customer_contacts_updated_at
  BEFORE UPDATE ON public.customer_contacts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Table 3: customer_interactions
CREATE TABLE public.customer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES customer_contacts(id) ON DELETE SET NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('meeting', 'call', 'email', 'proposal', 'contract_signed', 'invoice', 'note', 'other')),
  subject text NOT NULL,
  description text,
  interaction_date timestamptz NOT NULL DEFAULT now(),
  follow_up_date date,
  follow_up_notes text,
  is_completed boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all interactions"
  ON public.customer_interactions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view interactions"
  ON public.customer_interactions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM employees WHERE user_id IS NOT NULL));

CREATE POLICY "Employees can insert interactions"
  ON public.customer_interactions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM employees WHERE user_id IS NOT NULL));

CREATE INDEX idx_customer_interactions_customer_id ON public.customer_interactions(customer_id);
CREATE INDEX idx_customer_interactions_date ON public.customer_interactions(interaction_date DESC);
CREATE INDEX idx_customer_interactions_follow_up ON public.customer_interactions(follow_up_date) WHERE NOT is_completed;

-- Storage bucket for customer logos
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-logos', 'customer-logos', true);

CREATE POLICY "Anyone can view customer logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'customer-logos');

CREATE POLICY "Admins can upload customer logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'customer-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customer logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'customer-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customer logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'customer-logos' AND has_role(auth.uid(), 'admin'));
