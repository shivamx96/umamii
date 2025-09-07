-- Fix Row Level Security (RLS) policies for profile creation
-- This addresses the "new row violates row-level security policy" error

-- Add missing INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Also add a policy to allow the trigger function to insert profiles
-- Create a policy that allows inserts when the user is being created
CREATE POLICY "Allow profile creation during user registration" ON profiles
FOR INSERT TO authenticated
WITH CHECK (true);

-- Alternative approach: Temporarily disable RLS for the profiles table during user creation
-- (Uncomment the lines below if the above policies don't work)

-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- 
-- -- After testing, you can re-enable RLS with proper policies:
-- -- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Ensure all necessary policies exist for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Recreate policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);  
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Test the policies by checking if they exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';