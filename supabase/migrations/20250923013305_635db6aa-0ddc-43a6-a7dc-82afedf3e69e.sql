-- Assign admin role to the first user (assuming they are the system administrator)
-- This will allow at least one user to access admin-only features
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user from auth.users table (if any exist)
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If a user exists and doesn't already have a role, assign admin role
    IF first_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (first_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;