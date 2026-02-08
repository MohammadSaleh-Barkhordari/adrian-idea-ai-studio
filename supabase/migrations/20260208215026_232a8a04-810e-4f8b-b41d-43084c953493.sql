-- Drop the existing check constraint
ALTER TABLE adrian_projects 
DROP CONSTRAINT IF EXISTS adrian_projects_status_check;

-- Add the updated check constraint with in_progress included
ALTER TABLE adrian_projects 
ADD CONSTRAINT adrian_projects_status_check 
CHECK (status = ANY (ARRAY['planning', 'active', 'in_progress', 'on_hold', 'completed', 'cancelled']));