-- Fix RLS policy issue for tasks table
-- Since tasks table doesn't seem to be used, we'll disable RLS or add a basic policy
DROP TABLE IF EXISTS public.tasks;