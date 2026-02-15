
-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- App info
  app_name text NOT NULL,
  app_name_fa text,
  logo_url text,
  website_url text,
  category text DEFAULT 'other',
  
  -- What it's for
  purpose text,
  purpose_fa text,
  used_by_teams text[] DEFAULT '{}',
  
  -- Billing
  billing_cycle text DEFAULT 'monthly',
  cost_per_cycle numeric,
  currency text DEFAULT 'USD',
  payment_day integer,
  reset_day integer,
  
  -- Plan details
  plan_name text,
  max_seats integer,
  used_seats integer,
  usage_limit text,
  usage_limit_fa text,
  
  -- Dates
  start_date date,
  next_payment_date date,
  expiry_date date,
  
  -- Status
  status text NOT NULL DEFAULT 'active',
  auto_renew boolean DEFAULT true,
  
  -- Access info
  login_email text,
  login_method text,
  account_owner_id uuid REFERENCES employees(id),
  access_instructions text,
  access_instructions_fa text,
  
  -- Notes
  notes text,
  notes_fa text,
  tags text[] DEFAULT '{}',
  
  -- Metadata
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger for category
CREATE OR REPLACE FUNCTION public.validate_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.category IS NOT NULL AND NEW.category NOT IN (
    'ai_tools', 'design', 'development', 'communication', 
    'project_management', 'marketing', 'analytics', 
    'cloud_hosting', 'video_production', 'storage', '3d_modeling', 'other'
  ) THEN
    RAISE EXCEPTION 'Invalid category: %', NEW.category;
  END IF;
  
  IF NEW.billing_cycle IS NOT NULL AND NEW.billing_cycle NOT IN (
    'monthly', 'yearly', 'weekly', 'lifetime', 'free', 'pay_as_you_go'
  ) THEN
    RAISE EXCEPTION 'Invalid billing_cycle: %', NEW.billing_cycle;
  END IF;
  
  IF NEW.currency IS NOT NULL AND NEW.currency NOT IN ('USD', 'EUR', 'GBP', 'IRR') THEN
    RAISE EXCEPTION 'Invalid currency: %', NEW.currency;
  END IF;
  
  IF NEW.status NOT IN ('active', 'trial', 'cancelled', 'expired', 'paused', 'free_tier') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_subscription_fields_trigger
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.validate_subscription_fields();

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM employees WHERE status = 'active'));

-- Indexes
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_category ON public.subscriptions(category);
CREATE INDEX idx_subscriptions_next_payment ON public.subscriptions(next_payment_date);

-- Updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
