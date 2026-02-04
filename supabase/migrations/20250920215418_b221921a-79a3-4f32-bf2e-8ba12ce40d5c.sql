-- Add missing columns to letters table
ALTER TABLE letters 
ADD COLUMN IF NOT EXISTS letter_number VARCHAR,
ADD COLUMN IF NOT EXISTS has_attachment BOOLEAN DEFAULT false;

-- Create function to generate automatic letter numbers
CREATE OR REPLACE FUNCTION generate_letter_number(project_id_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    project_name TEXT;
    current_date_str TEXT;
    sequential_num INT;
    letter_num TEXT;
BEGIN
    -- Get project name/code from adrian_projects table
    SELECT project_name INTO project_name 
    FROM adrian_projects 
    WHERE project_id = project_id_param;
    
    -- If no project found, use project_id as fallback
    IF project_name IS NULL THEN
        project_name := project_id_param;
    END IF;
    
    -- Format current date as YYYYMMDD
    current_date_str := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    -- Get next sequential number for today
    SELECT COALESCE(MAX(CAST(RIGHT(letter_number, 3) AS INT)), 0) + 1
    INTO sequential_num
    FROM letters 
    WHERE letter_number LIKE 'CO' || current_date_str || '%'
    AND created_at::date = CURRENT_DATE;
    
    -- Generate letter number: CO[YYYYMMDD]/[ProjectCode]/[SequentialNumber]
    letter_num := 'CO' || current_date_str || '/' || project_name || '/' || LPAD(sequential_num::TEXT, 3, '0');
    
    RETURN letter_num;
END;
$$;

-- Create trigger to auto-generate letter number on insert
CREATE OR REPLACE FUNCTION auto_generate_letter_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.letter_number IS NULL THEN
        NEW.letter_number := generate_letter_number(NEW.project_id);
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_letter_number ON letters;
CREATE TRIGGER trigger_auto_generate_letter_number
    BEFORE INSERT ON letters
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_letter_number();