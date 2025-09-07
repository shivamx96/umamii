-- Migration script to update database schema from phone-based to email-based authentication
-- Run this in your Supabase SQL Editor

-- Step 1: Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Make phone_number optional (remove NOT NULL constraint)
ALTER TABLE profiles ALTER COLUMN phone_number DROP NOT NULL;

-- Step 3: Remove unique constraint on phone_number (since it's now optional)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_number_key;

-- Step 4: Add unique constraint on email
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Step 5: Update existing trigger function to work with email
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function for email-based auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, phone_number, name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NEW.email, profiles.email),
    phone_number = COALESCE(NEW.phone, profiles.phone_number);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create/update profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 6: Update any existing profiles with email from auth.users
-- This will populate email for existing users if any
UPDATE profiles 
SET email = auth_users.email
FROM auth.users as auth_users
WHERE profiles.id = auth_users.id 
AND (profiles.email IS NULL OR profiles.email = '');

-- Step 7: Make email required after populating existing data
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Optional: Add index on email for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Verification queries (run these to check the migration)
-- SELECT id, email, phone_number, name, username FROM profiles LIMIT 5;
-- SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'profiles';