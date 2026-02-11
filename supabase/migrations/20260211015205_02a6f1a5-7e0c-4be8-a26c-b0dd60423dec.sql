
-- Step 1: Drop the existing CHECK constraint on employment_type
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_employment_status_check;

-- Step 2: Rename employment_type to status
ALTER TABLE public.employees RENAME COLUMN employment_type TO status;

-- Step 3: Recreate CHECK constraint on the renamed status column
ALTER TABLE public.employees ADD CONSTRAINT employees_status_check 
  CHECK (status IN ('active', 'on_leave', 'terminated', 'resigned'));

-- Step 4: Add new employment_type column (nullable, for future use: full_time, part_time, contract, internship)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employment_type text;
