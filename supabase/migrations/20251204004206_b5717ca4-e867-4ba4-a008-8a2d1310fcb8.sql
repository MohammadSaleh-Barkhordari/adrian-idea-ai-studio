-- Add missing columns to employee_sensitive_data
ALTER TABLE public.employee_sensitive_data 
ADD COLUMN IF NOT EXISTS personal_email text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS date_of_birth date;