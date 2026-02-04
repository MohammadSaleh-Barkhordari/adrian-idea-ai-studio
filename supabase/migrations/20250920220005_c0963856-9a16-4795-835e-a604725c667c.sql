-- Fix the ambiguous column reference in generate_letter_number function
CREATE OR REPLACE FUNCTION generate_letter_number(project_id_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    proj_name TEXT;
    current_date_str TEXT;
    sequential_num INT;
    letter_num TEXT;
BEGIN
    -- Get project name/code from adrian_projects table
    SELECT ap.project_name INTO proj_name 
    FROM adrian_projects ap 
    WHERE ap.project_id = project_id_param;
    
    -- If no project found, use project_id as fallback
    IF proj_name IS NULL THEN
        proj_name := project_id_param;
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
    letter_num := 'CO' || current_date_str || '/' || proj_name || '/' || LPAD(sequential_num::TEXT, 3, '0');
    
    RETURN letter_num;
END;
$$;