-- Rename columns in employees table to match CSV structure
ALTER TABLE public.employees RENAME COLUMN first_name TO name;
ALTER TABLE public.employees RENAME COLUMN last_name TO surname;
ALTER TABLE public.employees RENAME COLUMN position TO job_title;
ALTER TABLE public.employees RENAME COLUMN employment_status TO employment_type;

-- Add new columns to employees table
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS job_type text DEFAULT 'general_user';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS created_by uuid;

-- Rename columns in employee_sensitive_data table to match CSV structure
ALTER TABLE public.employee_sensitive_data RENAME COLUMN address TO home_address;
ALTER TABLE public.employee_sensitive_data RENAME COLUMN bank_account TO bank_account_number;

-- Add new columns to employee_sensitive_data table
ALTER TABLE public.employee_sensitive_data ADD COLUMN IF NOT EXISTS contract_url text;